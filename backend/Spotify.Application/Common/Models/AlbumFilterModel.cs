using Spotify.Domain.Enums;

namespace Spotify.Application.Common.Models
{
    public class AlbumFilterModel
    {
        public string? Pattern { get; init; }
        public Guid? Id { get; init; }
    }
}