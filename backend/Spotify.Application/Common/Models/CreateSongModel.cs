using Spotify.Domain.Enums;

namespace Spotify.Application.Common.Models
{
    public class CreateSongModel
    {
        public Guid? AlbumId { get; init; }
        public Guid? AuthorId { get; init; }
        public MusicGenre? Genre { get; init; }
        public string? Name { get; init; }
    }
}

