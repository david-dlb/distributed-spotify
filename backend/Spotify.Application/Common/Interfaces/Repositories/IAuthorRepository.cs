using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Common.Interfaces.Repositories
{
    public interface IAuthorRepository
    {
        public Task<ErrorOr<Author>> Save(Author Author, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Author>> Update(Author Author, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Author>> GetById(Guid AuthorId, CancellationToken cancellationToken = default);
        public Task<ErrorOr<List<Author>>> GetAll(PaginationModel pagination, CancellationToken cancellationToken = default);
        public Task<ErrorOr<List<Author>>> GetAll(PaginationModel pagination, Func<Author, bool> filter, CancellationToken cancellationToken = default);
        public Task<ErrorOr<Success>> Delete(Guid AuthorId, CancellationToken cancellationToken = default);
    }
}