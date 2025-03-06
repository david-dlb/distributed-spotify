using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Models;
using Spotify.Domain.Common;
using Spotify.Domain.Common.Interfaces;
using Spotify.Domain.Entities;

namespace Spotify.Infrastructure.Repositories
{
    public class GenericRepository<T>(SpotifyDbContext context) where T : Entity
    {
        protected readonly SpotifyDbContext _context = context;

        public virtual async Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default)
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
            var table = _context.GetTable<T>(); 
            // TODO: Improve this way too much... 
            // The filtering is being made in memory which reduce performance because of several reasons: 
            // 1- More data to send from db. 
            // 2- Memory space wasted without needs
            // 3- Uci like approach xd.
            // Could be improved with LINQ operations and IQueryable but I feel lazy...     
            var values = await table.ToListAsync(cancellationToken);
            var filtered = values.Where(x => filter(x));
            var result = filtered.Skip(skip).Take(pagination.Limit).ToList(); 
            return result;             
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
        public async Task<ErrorOr<T>> Save(T value, CancellationToken cancellationToken = default) => await Save(value, cancellationToken , 1);

        private async Task<ErrorOr<T>> Save(T value, CancellationToken cancellationToken = default, int tryCount = 1)
        {
            try {
                var _values = _context.GetTable<T>(); 
                _values.Add(value);
                await _context.SaveChangesAsync(cancellationToken);
                return value;
            } catch {
                // Try again
                if(tryCount>5)
                {
                    throw;  
                }
                return await Save(value, cancellationToken, tryCount+1); 
            }
        }
        public async Task<ErrorOr<T>> Update(T newValue, CancellationToken cancellationToken = default) => await Update(newValue, cancellationToken, 1); 

        private async Task<ErrorOr<T>> Update(T newValue, CancellationToken cancellationToken = default, int tryCount = 1)
        {
            try{
                var _values = _context.GetTable<T>(); 
                var value = await _values.FirstOrDefaultAsync(x => x.Id == newValue.Id,cancellationToken);
                if (value == null)
                {
                    return Error.NotFound("Value not found.");
                }
                _values.Update(newValue); 
                await _context.SaveChangesAsync(cancellationToken);  
                return value;
            } catch {
                // Try again
                if(tryCount>5)
                {
                    throw;  
                }
                return await Save(newValue, cancellationToken, tryCount+1); 
            }
        }
    }

    public class SongRepository(SpotifyDbContext context, IDateTimeProvider dateTimeProvider) : GenericRepository<Song>(context), ISongRepository{
        private readonly IDateTimeProvider dateTimeProvider = dateTimeProvider;

        public override async Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default){
            var _values = _context.GetTable<Song>(); 
            var value = await _values.FirstOrDefaultAsync(x => x.Id == songId,cancellationToken);
            if (value == null)
            {
                return Error.NotFound("Value not found.");
            }
            value.Delete(dateTimeProvider);
            _values.Update(value); 
            await _context.SaveChangesAsync(cancellationToken);  
            return Result.Success;
        }
    }
    public class AlbumRepository(SpotifyDbContext context) : GenericRepository<Album>(context), IAlbumRepository{}
    public class AuthorRepository(SpotifyDbContext context) : GenericRepository<Author>(context), IAuthorRepository{}
}