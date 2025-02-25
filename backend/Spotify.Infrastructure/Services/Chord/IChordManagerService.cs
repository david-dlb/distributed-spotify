namespace Spotify.Infrastructure.Services.Chord
{
    public interface IChordManagerService
    {
        Task BroadCastIAmAliveAsync();
        Task HandleAliveFrom(string node);         
        Task<string> FindSuccessorAsync(int id);
        Task<string> StoreDataAsync(string key, string value);
        Task<string> GetDataAsync(string key);
        ChordNode Predecessor { get; set; }
        ChordNode Successor { get; set; }
    }
}