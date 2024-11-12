using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Common.Interfaces.Repositories
{
    public interface IAlbumRepository
    {
        public Task<ErrorOr<Album>> Save(Album Album, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Album>> Update(Album Album, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Album>> GetById(Guid AlbumId, CancellationToken cancellationToken = default);
        public Task<ErrorOr<List<Album>>> GetAll(PaginationModel pagination, CancellationToken cancellationToken = default);
        public Task<ErrorOr<List<Album>>> GetAll(PaginationModel pagination, Func<Album, bool> filter, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Success>> Delete(Guid AlbumId, CancellationToken cancellationToken = default);
    }
}