using ErrorOr;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Application.Common.Models;

namespace Spotify.Infrastructure.Services.Storage
{
    public class StorageService : IStorageService
    {

        public async Task<ErrorOr<byte[]>> ReadFileAsync(string id, ChunkRange range, CancellationToken ct)
        {
            var filePath = Path.Combine("../Spotify.Infrastructure/Persistence/Uploads", id);

            if (!File.Exists(filePath))
            {
                return Error.NotFound();
            }

            long start = range.Start, end = range.End;
            var chunkSize = (int)(end - start + 1);
            var buffer = new byte[chunkSize];
            
            using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                fileStream.Seek(start, SeekOrigin.Begin);
                await fileStream.ReadAsync(buffer.AsMemory(0, chunkSize), ct);
            }
            return buffer;  
        }


        public async Task<ErrorOr<Success>> SaveFileAsync(string id, Stream data, CancellationToken ct)
        {
            var filePath = Path.Combine("../Spotify.Infrastructure/Persistence/Uploads", id);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await data.CopyToAsync(stream,ct);
            }
            return Result.Success;
        }
    }
}