using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Models;
using Spotify.Domain.Common;
using Spotify.Domain.Entities;

namespace Spotify.Infrastructure.Repositories
{
    public class GenericRepository<T>(SpotifyDbContext context) where T : Entity
    {
        private readonly SpotifyDbContext _context = context;

        public async Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default)
        {
            var _values = _context.GetTable<T>(); 
            var song = await _values.FirstOrDefaultAsync(s => s.Id == songId,cancellationToken);
            if(song == null)
            {
                return Error.NotFound("Not found.");
            }
            _values.Remove(song);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success; 
        }

        public async Task<ErrorOr<List<T>>> GetAll(PaginationModel pagination, CancellationToken cancellationToken = default)
        {
            var _values = _context.GetTable<T>(); 
            int skip = pagination.Limit*(pagination.Page - 1);  
            var values = _values.Skip(skip).Take(pagination.Limit); 
            return await values.ToListAsync(cancellationToken);
        }

        public async Task<ErrorOr<List<T>>> GetAll(PaginationModel pagination, Func<T,bool> filter, CancellationToken cancellationToken = default)
        {
            int skip = pagination.Limit*(pagination.Page - 1);  
            var _values = _context.GetTable<T>(); 
              
            // filter = _values.Where .Skip(skip)
            //     .Take(pagination.Limit);
            var values = await _values.ToListAsync(cancellationToken);
            return values;
        }

        public async Task<ErrorOr<T>> GetById(Guid songId, CancellationToken cancellationToken = default)
        {
            var _values = _context.GetTable<T>(); 
            var value = await _values.FirstOrDefaultAsync(x => x.Id == songId,cancellationToken);

            if (value == null)
            {
                return Error.NotFound("Song not found.");
            }
            return value;
        }

        public async Task<ErrorOr<T>> Save(T value, CancellationToken cancellationToken = default)
        {
            var _values = _context.GetTable<T>(); 
            _values.Add(value);
            await _context.SaveChangesAsync(cancellationToken);
            return value;
        }

        public async Task<ErrorOr<T>> Update(T newValue, CancellationToken cancellationToken = default)
        {
            var _values = _context.GetTable<T>(); 
            var value = await _values.FirstOrDefaultAsync(x => x.Id == newValue.Id,cancellationToken);
            if (value == null)
            {
                return Error.NotFound("Value not found.");
            }
            _values.Update(newValue); 
            await _context.SaveChangesAsync(cancellationToken);  
            return value;
        }
    }

    public class SongRepository(SpotifyDbContext context) : GenericRepository<Song>(context), ISongRepository{}
    public class AlbumRepository(SpotifyDbContext context) : GenericRepository<Album>(context), IAlbumRepository
    {
        public Task<ErrorOr<List<Album>>> GetAll(PaginationModel pagination, Func<Album, bool> filter, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }
    public class AuthorRepository(SpotifyDbContext context) : GenericRepository<Author>(context), IAuthorRepository
    {
        public Task<ErrorOr<List<Author>>> GetAll(PaginationModel pagination, IQueryable<Album> filter, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<ErrorOr<List<Author>>> GetAll(PaginationModel pagination, Func<Author, bool> filter, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }
}