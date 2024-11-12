using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Common.Interfaces
{
    public interface ISongRepository
    {
        public Task<ErrorOr<Song>> Save(Song song); 
        public Task<ErrorOr<Song>> Update(Song song); 
        public Task<ErrorOr<Song>> GetById(Guid songId); 
        public Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination); 
    }
}