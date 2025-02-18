using System.Collections.Concurrent;

namespace Spotify.Infrastructure.Services.Chord
{
    public interface IChordManagerService
    {
        Task JoinNetworkAsync(string knownNodeUrl);
        Task<string> GetPredecessor();
        Task<string> FindSuccessorAsync(int id,bool logsOff = false);
        Task HandShakeAsync(string nodeUrl);
        Task StabilizeAsync();
        Task FixFingerTableAsync();
        Task<string> StoreDataAsync(string key, string value);
        Task<string> GetDataAsync(string key);
        ChordNode Predecessor { get; set; }
        ChordNode Successor { get; set; }
    }
}