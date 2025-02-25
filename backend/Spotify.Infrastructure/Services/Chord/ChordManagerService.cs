using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace Spotify.Infrastructure.Services.Chord
{
    public record StoreDataResponse(string Url, string Key);
    public record DataCatalog(List<string> Keys);

    public class ChordManagerService : IChordManagerService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly int _m = 16;
        private readonly int broadCastTimeOut = 5000;
        private readonly ChordNode _localNode;
        public ChordNode Predecessor { get; set; }
        public ChordNode Successor { get; set; }
        public ConcurrentDictionary<string, string> DataStore { get; } = new();

        public ChordManagerService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;

            var localIp = Dns.GetHostEntry(Dns.GetHostName())
                .AddressList.First(ip => ip.AddressFamily == AddressFamily.InterNetwork)
                .ToString();

            var port = _configuration["ASPNETCORE_URLS"]?.Split(':').Last() ?? "5000";
            var localUrl = $"http://{localIp}:{port}";

            _localNode = new ChordNode(localIp, _m);
            Log.Information("Inicializando nodo local en {LocalUrl} con Id: {Id} en ip: {Ip}", localUrl, _localNode.Id, localIp);
            Predecessor = _localNode;
            Successor = _localNode;
            _ = RequestDataCatalog(); 
        }

        private async Task<bool> CheckIfNodeIsAlive(ChordNode node)
        {
            try
            {
                if(node.Id == _localNode.Id)
                {
                    return true;
                }
                var response = await _httpClient.GetAsync($"{node.Url}/api/chord/alive");
                return response.StatusCode == HttpStatusCode.OK; 
            }
            catch
            {
                Log.Error("Nodo {NodeId} está muerto.", node.Id);
                return false;
            }
        }


        public Task HandleAliveFrom(string newNodeIp)
        {
            var newNode = new ChordNode(newNodeIp,_m); 
            if(newNode.Id == _localNode.Id)
                return Task.CompletedTask;
            
            if ((Predecessor == null || newNode.Id.IsIdInInterval(Predecessor.Id, _localNode.Id)) && newNode.Id != Predecessor.Id)
            {
                Log.Information("Actualizando Predecessor a {NewId}", newNode.Id);
                Predecessor = newNode;
            }
            if ((Successor == null || newNode.Id.IsIdInInterval(_localNode.Id, Successor.Id)) && newNode.Id != Successor.Id)
            {
                Log.Information("Actualizando Successor a {NewId}", newNode.Id);
                Successor = newNode;
            }
            return Task.CompletedTask;
        }

        public async Task<string> FindSuccessorAsync(int id)
        {
            if (id.IsIdInInterval(Predecessor.Id, _localNode.Id))
            {
                return _localNode.Url;
            }

            var isAlive = await CheckIfNodeIsAlive(Successor);
            if (!isAlive)
            {
                Log.Information("Successor is dead, waiting for stabilization."); 
                await Task.Delay(broadCastTimeOut + 200);
            }

            try
            {
                return await _httpClient.GetStringAsync($"{Successor.Url}/api/chord/find-successor?id={id}");
            }
            catch
            {
                Log.Error("El Successor no se actualizó correctamente tras el tiempo de espera. Nodo: {SuccessorId}", Successor.Id);
                throw;
            }
        }

        public async Task<StoreDataResponse> StoreDataAsync(string key, string value)
        {       
            // Se calcula el hash de la clave para determinar la posición en el anillo
            int keyHash = key.GenerateIntHash(_m);

            if (keyHash.IsIdInInterval(Predecessor.Id, _localNode.Id))
            {
                // El nodo local es responsable, se almacena localmente
                DataStore[key] = value;
                var responseObj = new StoreDataResponse(_localNode.Url, key);
                return responseObj;
            }
            else
            {
                // Se busca el nodo responsable y se reenvía la petición
                var nodeUrl = await FindSuccessorAsync(keyHash);
                if (nodeUrl == _localNode.Url)
                {
                    DataStore[key] = value;
                    var responseObj = new StoreDataResponse(_localNode.Url, key);
                    return responseObj;
                }
                else
                {
                    var payload = JsonSerializer.Serialize(value);
                    var content = new StringContent(payload, Encoding.UTF8, "application/json");
                    var response = await _httpClient.PostAsync($"{nodeUrl}/api/chord/store/{key}", content);
                    if (response.IsSuccessStatusCode)
                    {
                        return (await response.Content.ReadFromJsonAsync<StoreDataResponse>())!;
                    }
                    else
                    {
                        throw new Exception($"Error al almacenar la información en el nodo {nodeUrl}. Código de estado: {response.StatusCode}");
                    }
                }
            }
        }

        public async Task<string?> GetDataAsync(string key)
        {
            int keyHash = key.GenerateIntHash(_m);

            if (keyHash.IsIdInInterval(Predecessor.Id, _localNode.Id))
            {
                if (DataStore.TryGetValue(key, out var value))
                {
                    return value;
                }
                else
                {
                    return null; 
                }
            }
            else
            {
                var nodeUrl = await FindSuccessorAsync(keyHash);
                if (nodeUrl == _localNode.Url)
                {
                    if (DataStore.TryGetValue(key, out var value))
                    {
                        return value;
                    }
                    else
                    {
                        return null; 
                    }
                }
                else
                {
                    try
                    {
                        return await _httpClient.GetStringAsync($"{nodeUrl}/api/chord/data/{key}");
                    }
                    catch (Exception ex)
                    {
                        Log.Error("Error al recuperar la clave {Key} desde el nodo {NodeUrl}. Excepción: {Exception}", key, nodeUrl, ex);
                        throw;
                    }
                }
            }
        }

        public async Task BroadCastIAmAliveAsync()
        {
            using var udpClient = new UdpClient();
            udpClient.EnableBroadcast = true;

            string message = $"I am alive at {_localNode.Url}";
            byte[] data = Encoding.UTF8.GetBytes(message);

            IPEndPoint endPoint = new IPEndPoint(IPAddress.Broadcast, 6001);
            await udpClient.SendAsync(data, data.Length, endPoint);         
            Log.Information("Broadcasting. Status: Predecessor: {P} Id: {I} Successor: {S}", Predecessor.Id, _localNode.Id, Successor.Id);
        }


        public void Dispose()
        {
            Log.Information("Liberando recursos del ChordManagerService para el nodo {LocalUrl}.", _localNode.Url);
            GC.SuppressFinalize(this);
        }

        public async Task ForwardDataCatalog()
        {
            if(Successor.Id == _localNode.Id)
                return; 

            var catalog = await GetLocalCatalog();
            var dataToSend = JsonContent.Create(catalog); 
            var response = await _httpClient.PostAsync($"{Successor.Url}/api/chord/catalog/{_localNode.Ip}", dataToSend);            
            if(!response.IsSuccessStatusCode)
            {
                Log.Error("Error al enviar el catálogo al nodo {SuccessorUrl}. Código de estado: {StatusCode}", Successor.Url, response.StatusCode);
            }
        }

        public async Task ProcessCatalog(DataCatalog catalog, string ip)
        {
            ChordNode sourceNode = new ChordNode(ip, _m); 
            foreach (var key in catalog.Keys)
            {
                if(!DataStore.ContainsKey(key))
                {
                    Log.Information("Replication data with key: {K}", key); 
                    string data = await _httpClient.GetStringAsync($"{sourceNode.Url}/api/chord/data/local/{key}");
                    DataStore.TryAdd(key,data); 
                }   
            }
        }

        public async Task HealthCheck()
        {
            var successorIsAlive = await CheckIfNodeIsAlive(Successor); 
            var predecessorIsAlive = await CheckIfNodeIsAlive(Predecessor); 
            if(!successorIsAlive)
            {
                Log.Information("Successor is dead, setting local node as Successor."); 
                Successor = _localNode;
            }
            if(!predecessorIsAlive)
            {
                Log.Information("Predecessor is dead, setting local node as Predecessor."); 
                Predecessor = _localNode;
            }
        }
        public async Task RequestDataCatalog()
        {
            if(Successor.Id == _localNode.Id)
            {
                await Task.Delay(broadCastTimeOut + 200);
                await RequestDataCatalog();
                return;   
            } 
            Log.Information("Requesting catalog from {SuccessorUrl}", Successor.Url);

            var catalog = await _httpClient.GetFromJsonAsync<DataCatalog>($"{Successor.Url}/api/chord/catalog"); 
            await ProcessCatalog(catalog!, Successor.Ip); 
            Log.Information("Catalog processed.");
        }

        public Task<DataCatalog> GetLocalCatalog()
        {
            DataCatalog catalog = new([.. DataStore.Keys]); 
            return Task.FromResult(catalog);
        }

        public Task<string?> GetLocalDataAsync(string key)
        {
            if(DataStore.TryGetValue(key, out var value))
            {
                return Task.FromResult<string?>(value); 
            }
            return Task.FromResult<string?>(null);
        }
    }
}
