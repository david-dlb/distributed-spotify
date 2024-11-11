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

        public async Task<ErrorOr<Song?>> GetById(Guid songId)
        {
            return _songs.Find(x => x.Id == songId);
        }

        public async Task<ErrorOr<Song>> Save(Song song)
        {
            _songs.Add(song);
            return song;
        }

    }
}