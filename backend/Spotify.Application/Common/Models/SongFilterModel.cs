using Spotify.Domain.Enums;

namespace Spotify.Application.Common.Models
{
    public class SongFilterModel
    {
        public Guid? AuthorId { get; init; }
        public Guid? AlbumId { get; init; }
        public MusicGenre? Genre { get; init; }
        public Guid? Id { get; init; }
        public string? Pattern { get; init; }
    }
}