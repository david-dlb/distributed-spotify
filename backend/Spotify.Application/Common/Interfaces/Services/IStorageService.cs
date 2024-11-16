using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Domain.ValueObjects;

namespace Spotify.Application.Common.Interfaces.Services
{
    public interface IStorageService
    {
        public Task<ErrorOr<SongMetadata>> SaveFileAsync(string id, Stream data, CancellationToken ct);
        public ErrorOr<Success> DeleteFile(string id);
        public Task<ErrorOr<byte[]>> ReadFileAsync(string id, ChunkRange range, CancellationToken ct);
    }
}