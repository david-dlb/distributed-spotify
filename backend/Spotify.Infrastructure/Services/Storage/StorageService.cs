using ErrorOr;
using Spotify.Application.Common.Interfaces.Services;

namespace Spotify.Infrastructure.Services.Storage
{
    public class StorageService : IStorageService
    {

        public Task<ErrorOr<Stream>> ReadFileAsync(string id, CancellationToken ct)
        {
            throw new NotImplementedException();
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