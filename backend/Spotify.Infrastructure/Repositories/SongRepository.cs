using ErrorOr;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Models;
using Spotify.Domain.Common;
using Spotify.Domain.Entities;

namespace Spotify.Infrastructure.Repositories
{
    public class InMemoryGenericRepository<T> where T : Entity
    {
        private static List<T> _values = [];

        public async Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default)
        {
            var song = _values.Find(s => s.Id == songId);
            _values.Remove(song);
            return Result.Success; 
        }

        public async Task<ErrorOr<List<T>>> GetAll(PaginationModel pagination, CancellationToken cancellationToken = default)
        {
            int skip = pagination.Limit*(pagination.Page - 1);  
            var values = _values.Skip(skip).Take(pagination.Limit); 
            return values.ToList();
        }

        public async Task<ErrorOr<List<T>>> GetAll(PaginationModel pagination, Func<T,bool> filter, CancellationToken cancellationToken = default)
        {
            var filteredValues = _values.Where(x => filter(x)); 
            int skip = pagination.Limit*(pagination.Page - 1);  
            var values = filteredValues.Skip(skip).Take(pagination.Limit); 
            return values.ToList();
        }

        public async Task<ErrorOr<T>> GetById(Guid songId, CancellationToken cancellationToken = default)
        {
            var value = _values.Find(x => x.Id == songId);

            if (value == null)
            {
                return Error.NotFound("Song not found.");
            }
            return value;
        }

        public async Task<ErrorOr<T>> Save(T value, CancellationToken cancellationToken = default)
        {
            _values.Add(value);
            return value;
        }

        public async Task<ErrorOr<T>> Update(T newValue, CancellationToken cancellationToken = default)
        {
            var value = _values.Find(x => x.Id == newValue.Id);
            if (value == null)
            {
                return Error.NotFound("Value not found.");
            }
            _values.Remove(value); 
            _values.Add(newValue); 
            return value;
        }
    } 

    public class InMemorySongRepository : InMemoryGenericRepository<Song>, ISongRepository {}
    public class InMemoryAlbumRepository : InMemoryGenericRepository<Album>, IAlbumRepository {}
}