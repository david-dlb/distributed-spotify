using ErrorOr;
using Spotify.Domain.Entities;

namespace Spotify.Application.Common.Interfaces
{
    public interface ISongRepository
    {
        public Task<ErrorOr<bool>> Save(Song song); 
        public Task<ErrorOr<Song>> GetById(Guid songId); 
        public Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination); 
    }
}