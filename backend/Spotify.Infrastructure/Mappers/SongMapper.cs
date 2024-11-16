
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

public class SongDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid? AuthorId { get; set; }
    public Author? Author { get; set; }    
    public Guid? AlbumId { get; set; }
    public Album? Album { get; set; }    
    public MusicGenre? Genre { get; set; }
    public int ChunksCount { get; set; }
}
public static class SongMapper
{
    public static SongDto ToDto(this Song song)
    {
        return new SongDto()
        {
            Id = song.Id,
            Album = song.Album,
            AlbumId = song.AlbumId,
            Author = song.Author,
            AuthorId = song.AuthorId,
            ChunksCount = song?.Metadata?.Chunks.Count ?? 0,
            Genre = song!.Genre,
            Name = song!.Name
        };
    } 
} 