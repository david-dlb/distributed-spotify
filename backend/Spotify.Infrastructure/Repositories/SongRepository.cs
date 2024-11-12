using ErrorOr;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Infrastructure.Repositories
{
    public class InMemorySongRepository : ISongRepository
    {
        private static List<Song> _songs = []; 
        public async Task<ErrorOr<List<Song>>> GetAll(PaginationModel pagination)
        {
            int skip = pagination.Limit*(pagination.Page - 1);  
            var songs = _songs.Skip(skip).Take(pagination.Limit); 
            return songs.ToList();
        }

        public async Task<ErrorOr<Song>> GetById(Guid songId)
        {
            var song = _songs.Find(x => x.Id == songId);

            if (song == null)
            {
                return Error.NotFound("Song not found.");
            }
            return song;
        }

        public async Task<ErrorOr<Song>> Save(Song song)
        {
            _songs.Add(song);
            return song;
        }

        public async Task<ErrorOr<Song>> Update(Song newSong)
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