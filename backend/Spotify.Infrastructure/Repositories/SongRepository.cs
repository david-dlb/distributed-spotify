using ErrorOr;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Infrastructure.Repositories
{
    public class InMemorySongRepository : ISongRepository
    {
        private static List<Song> _songs = [];

        public async Task<ErrorOr<Success>> Delete(Guid songId, CancellationToken cancellationToken = default)
        {
            var song = _songs.Find(s => s.Id == songId);
            _songs.Remove(song);
            return Result.Success; 
        }

        public async Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination, CancellationToken cancellationToken = default)
        {
            int skip = pagination.Limit*(pagination.Page - 1);  
            var songs = _songs.Skip(skip).Take(pagination.Limit); 
            return songs.ToList();
        }

        public async Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination, Func<Song,bool> filter, CancellationToken cancellationToken = default)
        {
            var filteredSongs = _songs.Where(x => filter(x)); 
            int skip = pagination.Limit*(pagination.Page - 1);  
            var songs = filteredSongs.Skip(skip).Take(pagination.Limit); 
            return songs.ToList();
        }

        public async Task<ErrorOr<Song>> GetById(Guid songId, CancellationToken cancellationToken = default)
        {
            var song = _songs.Find(x => x.Id == songId);

            if (song == null)
            {
                return Error.NotFound("Song not found.");
            }
            return song;
        }

        public async Task<ErrorOr<Song>> Save(Song song, CancellationToken cancellationToken = default)
        {
            _songs.Add(song);
            return song;
        }

        public async Task<ErrorOr<Song>> Update(Song newSong, CancellationToken cancellationToken = default)
        {
            var song = _songs.Find(x => x.Id == newSong.Id);
            if (song == null)
            {
                return Error.NotFound("Song not found.");
            }
            _songs.Remove(song); 
            _songs.Add(newSong); 
            return song;
        }
    }
}