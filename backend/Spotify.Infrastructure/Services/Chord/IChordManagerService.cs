using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Application.Songs.Commands.Update;
using Spotify.Domain.Entities;

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
        Task<ErrorOr<Song>> UpdateDataAsync(UpdateSongCommand update);
        Task<ErrorOr<byte[]>> GetDataAsync(string SongIdKey, int index);
        Task<ErrorOr<byte[]>> GetLocalDataAsync(string SongIdKey, int index);
        Task ForwardDataCatalog(); 
        Task HealthCheck();
        Task<DataCatalog> GetLocalCatalog();
        Task ProcessCatalog(DataCatalog catalog, string sourceIp); 
        ChordNode Predecessor { get; set; }
        ChordNode Successor { get; set; }
    }
}