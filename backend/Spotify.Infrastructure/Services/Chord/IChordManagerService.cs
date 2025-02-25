namespace Spotify.Infrastructure.Services.Chord
{
    public interface IChordManagerService
    {
        Task BroadCastIAmAliveAsync();
        Task HandleAliveFrom(string node);         
        Task<string> FindSuccessorAsync(int id);
        Task<string> StoreDataAsync(string key, string value);
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