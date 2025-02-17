using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace Spotify.Infrastructure.Services.Chord
{
    public class ChordManagerService : IChordManagerService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly Timer _stabilizationTimer;
        private readonly int _m = 4;
        private readonly ChordNode _localNode;
        private readonly ConcurrentDictionary<int, ChordNode> _knownNodes = new();
        private ConcurrentDictionary<int, ChordNode> _fingerTable = new();
        public ChordNode Predecessor { get; set; }
        public ChordNode Successor { get; set; }
        public ConcurrentDictionary<string, string> DataStore { get; } = new();

        public ChordManagerService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;

            // Obtener la IP local
            var localIp = Dns.GetHostEntry(Dns.GetHostName())
                .AddressList.First(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                .ToString();

            var port = _configuration["ASPNETCORE_URLS"]?.Split(':').Last() ?? "5000";
            
            //  TODO: parche para pruebas!!
            var localUrl = $"http://localhost:{port}";
            // var localUrl = $"http://{localIp}:{port}";
            

            Log.Information($"Inicializando nodo local en {localUrl}");
            _localNode = new ChordNode(localUrl);
            InitializeFingerTable();

            // Timer para estabilización y actualización de la tabla de dedos
        //     _stabilizationTimer = new Timer(async (_ )=>
        // {
        //     try
        //     {
        //         await StabilizeAsync();
        //     }
        //     catch (Exception ex)
        //     {
        //         Log.Error(ex, "Error en la tarea de estabilización.");
        //     }
        // }, null, TimeSpan.Zero, TimeSpan.FromSeconds(10));
        }

        private void InitializeFingerTable()
        {
            Log.Information("Inicializando finger table para nodo local {LocalUrl}", _localNode.Url);
            _fingerTable = new ConcurrentDictionary<int, ChordNode>();

            for (var i = 0; i < _m; i++)
            {
                int fingerId = (_localNode.Id + (1 << i)) % 16; // Calculamos la ID en el anillo de 16 nodos
                _fingerTable[i] = _localNode; // Inicialmente nos apuntamos a nosotros mismos
            }

            Successor = _localNode;
            Predecessor = _localNode;
            Log.Information($"Finger table inicializada con un anillo de {_m} nodos.");
        }

        public async Task JoinNetworkAsync(string knownNodeUrl)
        {
            if(knownNodeUrl == _localNode.Url)
            {
                Log.Information("Nodo {Id} ha iniciado una red unitaria en {LocalUrl}.",_localNode.Id, _localNode.Url);
                return; 
            }
            else 
            {
                Log.Information("Intentando unirse a la red. Nodo conocido: {KnownNodeUrl}", knownNodeUrl);
            }

            if (!string.IsNullOrEmpty(knownNodeUrl))
            {
                var knownNode = new ChordNode(knownNodeUrl);
                _knownNodes.TryAdd(knownNode.Id, knownNode);
                Log.Information("Nodo conocido {KnownNodeUrl} agregado a la lista de nodos conocidos.", knownNodeUrl);

                // Buscar el sucesor para el nodo local a partir del nodo conocido.
                Successor = await FindSuccessorAsync(_localNode.Id, knownNode);
                Predecessor = Successor; 

                //  TODO: parche para pruebas!!
                Successor.Url = "http://localhost:6001";
                 
                _fingerTable[1] = Successor;
                Log.Information("Successor actualizado a {SuccessorUrl}", Successor.Url);
               
                var notifyUrl = $"{Successor.Url}/api/chord/notify?nodeUrl={_localNode.Url}";
                await _httpClient.PostAsync(notifyUrl, null);
            
                // Inicializar datos locales a partir de datos remotos
                // var response = await _httpClient.GetAsync($"{Successor.Url}/api/chord/init-data");
                // if (response.IsSuccessStatusCode)
                // {
                //     Log.Information("Recuperando datos de inicialización desde {SuccessorUrl}", Successor.Url);
                //     var data = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                //     foreach (var item in data)
                //     {
                //         DataStore.TryAdd(item.Key, item.Value);
                //         Log.Information("Dato agregado: {Key} -> {Value}", item.Key, item.Value);
                //     }
                // }
                // else
                // {
                //     Log.Warning("No se pudieron recuperar datos de {SuccessorUrl}. Status: {StatusCode}", Successor.Url, response.StatusCode);
                // }
            }
            else
            {   
                throw new ArgumentException("No se proporciono nodo conocido al que unirse."); 
            }
            Log.Information("Nodo {LocalUrl} se ha unido a la red. Successor: {SuccessorUrl}", _localNode.Url, Successor.Url);
        }

        public async Task<string> FindSuccessorAsync(int id)
        {
            Log.Information("Buscando Successor para ID: {Id}", id);

            // Caso especial: Si el nodo es único en el anillo, retorna el nodo local.
            if (Successor.Url == _localNode.Url && Predecessor.Url == _localNode.Url)
            {
                Log.Information("Único nodo en el anillo. Retornando nodo local {LocalUrl} como Successor.", _localNode.Url);
                return _localNode.Url;
            }

            if (IsIdInInterval(id, _localNode.Id, Successor.Id))
            {
                Log.Information("ID {Id} se encuentra en el intervalo ({LocalId}, {SuccessorId}]. Retornando Successor {SuccessorUrl}.", 
                    id, _localNode.Id, Successor.Id, Successor.Url);
                return Successor.Url;
            }

            var closestNode = await GetClosestPrecedingNodeAsync(id);
            Log.Information("Nodo más cercano a {Id} es {ClosestNodeUrl}. Buscando Successor desde ese nodo.", id, closestNode.Url);
            var resultNode = await FindSuccessorAsync(id, closestNode);
            Log.Information("Successor encontrado para ID {Id} es {SuccessorUrl}.", id, resultNode.Url);
            return resultNode.Url;
        }

        private async Task<ChordNode> FindSuccessorAsync(int id, ChordNode startNode)
        {
            Log.Information("Buscando Successor para ID {Id} a partir de nodo {StartNodeUrl}.", id, startNode.Url);

            // Caso especial: Si el nodo de partida es el nodo local, se asume nodo único.
            if (startNode.Id == _localNode.Id)
            {
                Log.Information("Nodo de partida es el nodo local. Retornando nodo local {LocalUrl}.", _localNode.Url);
                return _localNode;
            }

            try
            {
                var url = $"{startNode.Url}/api/chord/find-successor?id={id}";
                Log.Information("Enviando solicitud GET a {Url}", url);
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var successorUrl = await response.Content.ReadAsStringAsync();
                Log.Information("Respuesta recibida. Successor: {SuccessorUrl}", successorUrl);
                return new ChordNode(successorUrl);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error al buscar Successor a través de {StartNodeUrl} para ID {Id}", startNode.Url, id);
                throw;
            }
        }

        private async Task<ChordNode> GetClosestPrecedingNodeAsync(int id)
        {
            Log.Information("Buscando el nodo más cercano anterior a {Id} en la finger table.", id);
            for (var i = _m - 1; i >= 0; i--)
            {
                if (_fingerTable.TryGetValue(i, out var fingerNode) && IsIdInInterval(fingerNode.Id, _localNode.Id, id))
                {
                    Log.Information("Nodo {FingerNodeUrl} (finger {i}) es el más cercano anterior a {Id}.", fingerNode.Url, i, id);
                    return fingerNode;
                }
            }
            Log.Information("Ningún nodo en la finger table precede a {Id}. Retornando nodo local {LocalUrl}.", id, _localNode.Url);
            return _localNode;
        }

        public async Task HandShakeAsync(string nodeUrl)
        {
            Log.Information("Handshake desde el nodo {NodeUrl}.", nodeUrl);
            var newNode = new ChordNode(nodeUrl);
            if (newNode.Id == _localNode.Id)
                return;
                
            _knownNodes.TryAdd(newNode.Id, newNode);
            if (Predecessor == null || IsIdInInterval(newNode.Id, Predecessor.Id, _localNode.Id))
            {
                Log.Information("Actualizando Predecessor a nodo {NodeUrl}.", nodeUrl);
                Predecessor = newNode;
            }
            if (Successor == null || IsIdInInterval(newNode.Id, _localNode.Id, Successor.Id))
            {
                Log.Information("Actualizando Successor a nodo {NodeUrl}.", nodeUrl);
                Successor = newNode;
            }
            await Task.CompletedTask;
        }

        public async Task StabilizeAsync()
        {
            Log.Information("Iniciando proceso de estabilización para nodo local {LocalUrl}.", _localNode.Url);
            try
            {

                if(Successor.Url == _localNode.Url)
                {
                    // This means that this node belives it's in a unitary ring
                    Log.Information("El succesor de este nodo es el mismo.");
                    if(Predecessor.Url != _localNode.Url)
                    {
                        Log.Information("Igualando Successor a Predecessor {Id}, red de 2 nodos identificada", Predecessor.Id);
                        Successor = Predecessor; 
                    }
                    return; 
                }

                var predecessorUrlEndpoint = $"{Successor.Url}/api/chord/predecessor";
                Log.Information("Consultando predecessor del Successor en {Endpoint}", predecessorUrlEndpoint);
                var response = await _httpClient.GetAsync(predecessorUrlEndpoint);
                if (response.IsSuccessStatusCode)
                {
                    var predecessorUrl = await response.Content.ReadAsStringAsync();
                    Log.Information("Predecessor recibido: {PredecessorUrl}", predecessorUrl);
                    if (!string.IsNullOrEmpty(predecessorUrl))
                    {
                        var predecessor = new ChordNode(predecessorUrl);
                        if (predecessor.Id == _localNode.Id)
                        {
                            Log.Information("Nodo {Id1} mantiene su sucessor {Id2}.", _localNode.Id, Successor.Id);
                            return; 
                        }
                        if (IsIdInInterval(predecessor.Id, _localNode.Id, Successor.Id))
                        {
                            Log.Information("Actualizando Successor. Nuevo Successor: {PredecessorUrl}", predecessorUrl);
                            Successor = predecessor;
                        }
                    }
                }
                var notifyUrl = $"{Successor.Url}/api/chord/notify?nodeUrl={_localNode.Url}";
                Log.Information("Enviando notificación de estabilización a Successor en {NotifyUrl}", notifyUrl);
                await _httpClient.PostAsync(notifyUrl, null);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error durante la estabilización del nodo {LocalUrl}", _localNode.Url);
            }
        }

        public async Task FixFingerTableAsync()
        {
            Log.Information("Iniciando actualización de la finger table para nodo {LocalUrl}", _localNode.Url);
            var random = new Random();
            var next = random.Next(1, _m);
            Log.Information("Seleccionado índice {Next} para actualizar finger table.", next);
            // TODO: explore if this is correct
            // var fingerId = GenerateSha1Hash(_localNode.Id + next);
            // Log.Information("ID calculado para finger table: {FingerId}", fingerId);
            // _fingerTable[next] = await FindSuccessorAsync(fingerId, _localNode);
            Log.Information("Finger table actualizada en índice {Next} con nodo {FingerUrl}", next, _fingerTable[next].Url);
        }

        public async Task<string> StoreDataAsync(string key, string value)
        {
            Log.Information("Almacenando dato. Clave: {Key}, Valor: {Value}", key, value);
            var keyHash = GenerateSha1Hash(key);
            Log.Information("Hash generado para clave {Key}: {KeyHash} % {M} = {Nodo}", key, keyHash, _m, keyHash%_m);
            var responsibleNode = await FindSuccessorAsync(keyHash, _localNode);
            Log.Information("Nodo responsable para la clave {Key} es {ResponsibleUrl}", key, responsibleNode.Url);
            
            if (responsibleNode.Url == _localNode.Url)
            {
                DataStore[key] = value;
                Log.Information("Dato almacenado localmente. Clave: {Key} en nodo {LocalUrl}", key, _localNode.Url);
                return _localNode.Url;
            }
            
            var storeUrl = $"{responsibleNode.Url}/api/chord/store/{key}";
            Log.Information("Enviando dato a nodo remoto en {StoreUrl}", storeUrl);
            await _httpClient.PostAsync(
                storeUrl, 
                new StringContent(value, Encoding.UTF8, "application/json"));
            
            Log.Information("Dato almacenado en nodo remoto {ResponsibleUrl} para clave {Key}", responsibleNode.Url, key);
            return responsibleNode.Url;
        }

        public async Task<string> GetDataAsync(string key)
        {
            Log.Information("Recuperando dato para la clave {Key}", key);
            var keyHash = GenerateSha1Hash(key);
            Log.Information("Hash generado para clave {Key}: {KeyHash} % {M} = {Nodo}", key, keyHash, _m, keyHash % _m);
            var responsibleNode = await FindSuccessorAsync(keyHash % _m, _localNode);
            Log.Information("Nodo responsable para la clave {Key} es {ResponsibleUrl}", key, responsibleNode.Url);
            
            if (responsibleNode.Url == _localNode.Url)
            {
                Log.Information("Dato recuperado localmente para la clave {Key}.", key);
                return DataStore.TryGetValue(key, out var value) ? value : null;
            }

            var dataUrl = $"{responsibleNode.Url}/api/chord/data/{key}";
            Log.Information("Enviando solicitud GET a {DataUrl} para recuperar dato.", dataUrl);
            var response = await _httpClient.GetAsync(dataUrl);
            var result = await response.Content.ReadAsStringAsync();
            Log.Information("Dato recuperado de nodo {ResponsibleUrl} para la clave {Key}.", responsibleNode.Url, key);
            return result;
        }

        private bool IsIdInInterval(int id, int start, int end)
        {
            // Caso de nodo único: start y end son iguales
            if (start == end)
            {
                Log.Information("Intervalo detectado como nodo único (start == end). Retornando true para cualquier ID.");
                return true;
            }

            // Caso sin wrap-around
            if (start < end)
            {
                var result = id > start && id <= end;
                Log.Information("Evaluando intervalo sin wrap-around: ({Start}, {End}]. ID: {Id} -> {Result}", start, end, id, result);
                return result;
            }
            else
            {
                // Caso con wrap-around: el intervalo es (start, max] U [min, end]
                var result = (id > start && id <= _m )|| (id >= 0 && id <= end);
                Log.Information("Evaluando intervalo con wrap-around: ({Start}, max] U [min, {End}]. ID: {Id} -> {Result}", start, end, id, result);
                return result;
            }
        }

        private int GenerateSha1Hash(string input)
        {
            using var sha1 = SHA1.Create();
            var inputBytes = Encoding.UTF8.GetBytes(input);
            var hashBytes = sha1.ComputeHash(inputBytes);
            int hashInt = BitConverter.ToInt32(hashBytes, 0);
            Log.Information("Hash SHA1 generado para entrada '{Input}': {Hash}", input, hashInt);
            return hashInt;
        }

        public void Dispose()
        {
            Log.Information("Liberando recursos del ChordManagerService para nodo {LocalUrl}.", _localNode.Url);
            _stabilizationTimer?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
