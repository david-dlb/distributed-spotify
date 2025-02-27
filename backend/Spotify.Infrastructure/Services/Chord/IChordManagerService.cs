using Spotify.Application.Common.Models;

namespace Spotify.Infrastructure.Services.Chord
{
    public class CreateSongData
    {
        public required Stream SongFileStream { get; init; } 
        public required CreateSongModel Model { get; init; } 
    }

    public interface IChordManagerService
    {
        Task BroadCastIAmAliveAsync();
        Task HandleAliveFrom(string node);         
        Task<string> FindSuccessorAsync(int id);
        Task<SongDto> StoreDataAsync(string key, CreateSongData value);
        Task<string?> GetDataAsync(string key);
        Task<string?> GetLocalDataAsync(string key);
        Task ForwardDataCatalog(); 
        Task HealthCheck();
        Task<DataCatalog> GetLocalCatalog();
        Task ProcessCatalog(DataCatalog catalog, string sourceIp); 
        ChordNode Predecessor { get; set; }
        ChordNode Successor { get; set; }
    }
}