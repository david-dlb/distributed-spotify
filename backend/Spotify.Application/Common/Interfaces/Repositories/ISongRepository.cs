using System.ComponentModel;
using ErrorOr;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Common.Interfaces
{
    public interface ISongRepository
    {
        public Task<ErrorOr<Song>> Save(Song song, CancellationToken cancellationToken = default); 
        public Task<ErrorOr<Song>> Update(Song song, CancellationToken cancellationToken = default); 
        public Task<ErrorOr<Song>> GetById(Guid songId, CancellationToken cancellationToken = default); 
        public Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination,  CancellationToken cancellationToken = default); 
        public Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination, Func<Song,bool> filter,  CancellationToken cancellationToken = default); 
        public Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default); 
    }
}