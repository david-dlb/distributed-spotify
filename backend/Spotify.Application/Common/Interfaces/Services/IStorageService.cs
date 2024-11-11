using ErrorOr;

namespace Spotify.Application.Common.Interfaces.Services
{
    public interface IStorageService
    {
        public Task<ErrorOr<Success>> SaveFileAsync(string id, Stream data, CancellationToken ct);
        public Task<ErrorOr<Stream>> ReadFileAsync(string id, CancellationToken ct);
    }
}