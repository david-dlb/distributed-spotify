using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using ErrorOr;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Spotify.Application.Models;
using Spotify.Application.Songs.Commands.Create;
using Spotify.Application.Songs.Queries.GetChunkIndexed;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

namespace Spotify.Infrastructure.Services.Chord
{
    public record StoreDataResponse(string Url, string Key, ErrorOr<Song> result);
    public record DataCatalog(List<string> Keys);

    public class ChordManagerService : IChordManagerService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _serviceScopeProvider;
        private readonly int _m = 16;
        private readonly int broadCastTimeOut = 5000;
        private readonly ChordNode _localNode;
        public ChordNode Predecessor { get; set; }
        public ChordNode Successor { get; set; }
        public ConcurrentDictionary<string, string> DataStore { get; } = new();

        public ChordManagerService(HttpClient httpClient, IConfiguration configuration, IServiceScopeFactory serviceScopeProvider)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _serviceScopeProvider = serviceScopeProvider;
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
            // DONE
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
            // DONE
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
            // DONE: but may be improved
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

        public async Task<SongDto> StoreDataAsync(string key, CreateSongData input)
        {
            int keyHash = key.GenerateIntHash(_m);
            using var scope = _serviceScopeProvider.CreateScope(); 
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>(); 

            ArgumentNullException.ThrowIfNull(input.SongFileStream); 
         
            if (keyHash.IsIdInInterval(Predecessor.Id, _localNode.Id))
            {
                Log.Information("Creating the song locally");
                var songsResult = await mediator.Send(new CreateSongCommand()
                {
                    Id = input.Model.Id,
                    AlbumId = input.Model.AlbumId,
                    AuthorId = input.Model.AuthorId,
                    Genre = input.Model.Genre,
                    Name = input.Model.Name ?? "UNKNOWN",
                    Stream = input.SongFileStream
                }, default);

                var songDto = songsResult.Value; 
                return songDto.ToDto();
            }
            else
            {
                var nodeUrl = await FindSuccessorAsync(keyHash);
                if (nodeUrl == _localNode.Url)
                {
                    Log.Information("Creating the song locally");
                    var songsResult = await mediator.Send(new CreateSongCommand()
                    {
                        Id = input.Model.Id,
                        AlbumId = input.Model.AlbumId,
                        AuthorId = input.Model.AuthorId,
                        Genre = input.Model.Genre,
                        Name = input.Model.Name ?? "UNKNOWN",
                        Stream = input.SongFileStream
                    }, default);

                    var songDto = songsResult.Value; 
                    return songDto.ToDto();
                }
                else
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await input.SongFileStream.CopyToAsync(memoryStream);
                        memoryStream.Position = 0;
                        
                        Log.Information("Creating the song remotely at {url}", nodeUrl);
                        
                        var formData = new MultipartFormDataContent
                        {
                            { new StringContent(input.Model.Id.ToString()), "Id" },
                            { new StringContent(input.Model.AlbumId?.ToString() ?? ""), "AlbumId" },
                            { new StringContent(input.Model.AuthorId?.ToString() ?? ""), "AuthorId" },
                            { new StringContent(((int)(input.Model.Genre ?? MusicGenre.Unknown) ).ToString(), Encoding.UTF8), "Genre" },
                            { new StringContent(input.Model.Name ?? "UNKNOWN"), "Name" },
                            { new StreamContent(memoryStream), "songFile", "song.mp3" } 
                        };

                        var response = await _httpClient.PostAsync($"{nodeUrl}/api/Song", formData);

                        if (response.IsSuccessStatusCode)
                        {
                            var result = await response.Content.ReadFromJsonAsync<CommonResponse<SongDto>>(new System.Text.Json.JsonSerializerOptions(){
                                IncludeFields = true,
                                PropertyNameCaseInsensitive = true
                            });          
                            if(result!.Success)
                            {
                                return result.Value!;

                            }   // RETRY MECHANISM
                            Log.Error("Error al almacenar la información en el nodo {nodeUrl}. Error: {errorMessage}, Detalles: {errorDetails}", nodeUrl, result.ErrorMessage, result.ErrorDetails);
                            throw new Exception($"Error al almacenar la información en el nodo {nodeUrl}. Código de estado: {response.StatusCode}, {await response.Content.ReadAsStringAsync()}, {response.RequestMessage}");
                        }
                        else
                        {
                            throw new Exception($"Error al almacenar la información en el nodo {nodeUrl}. Código de estado: {response.StatusCode}, {await response.Content.ReadAsStringAsync()}, {response.RequestMessage}");
                        }
                    }


                }
            }
        }

        public async Task<ErrorOr<byte[]>> GetDataAsync(string SongIdKey, int index)
        {
            int keyHash = SongIdKey.GenerateIntHash(_m);

            if (keyHash.IsIdInInterval(Predecessor.Id, _localNode.Id))
            {
                return await GetLocalDataAsync(SongIdKey, index);
            }
            else
            {
                var nodeUrl = await FindSuccessorAsync(keyHash);
                if (nodeUrl == _localNode.Url)
                {
                    return await GetLocalDataAsync(SongIdKey, index);
                }
                else
                {
                    try
                    {
                        Log.Information("Reading the song remotely from {url}", nodeUrl);
                        var data = await _httpClient.GetStreamAsync($"{nodeUrl}/api/Song/download/indexed?songId={SongIdKey}&index={index}");
                        using var memoryStream = new MemoryStream();
                        await data.CopyToAsync(memoryStream);
                        return memoryStream.ToArray(); 
                    }
                    catch (Exception ex)
                    {
                        Log.Error("Error al recuperar la clave {Key} desde el nodo {NodeUrl}. Excepción: {Exception}", SongIdKey, nodeUrl, ex);
                        return Error.Unexpected(description: ex.Message); 
                    }
                }
            }
        }

        public async Task BroadCastIAmAliveAsync()
        {
            // DONE
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
            // DONE
            Log.Information("Liberando recursos del ChordManagerService para el nodo {LocalUrl}.", _localNode.Url);
            GC.SuppressFinalize(this);
        }

        public async Task ForwardDataCatalog()
        {
            // DONE
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
            // TODO:
            ChordNode sourceNode = new ChordNode(ip, _m); 
            foreach (var key in catalog.Keys)
            {
                if(!DataStore.ContainsKey(key))
                {
                    // TODO:
                    // Log.Information("Replication data with key: {K}", key); 
                    // string data = await _httpClient.GetStringAsync($"{sourceNode.Url}/api/chord/data/local/{key}");
                    // DataStore.TryAdd(key,data); 
                }   
            }
        }

        public async Task HealthCheck()
        {
            // DONE
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
            // DONE
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
            // TODO: 
            DataCatalog catalog = new([.. DataStore.Keys]); 
            return Task.FromResult(catalog);
        }

        public async Task<ErrorOr<byte[]>> GetLocalDataAsync(string SongIdKey, int index)
        {
            using var scope = _serviceScopeProvider.CreateScope(); 
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>(); 

            var result = await mediator.Send(
                new GetChunkIndexedSongQuery(new Guid(SongIdKey), index),
                default
            );
            return result; 
        }
    }
}
