
using System.Text.Json.Serialization;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

public class SongDto
{

    [JsonPropertyName("Id")]
    public string Id { get; set; }
   
    [JsonPropertyName("Name")]
 public string Name { get; set; }
    [JsonPropertyName("AuthorId")]
    public string? AuthorId { get; set; }
    
    [JsonPropertyName("Author")]
    public Author? Author { get; set; }    
    
    [JsonPropertyName("AlbumId")]
    public string? AlbumId { get; set; }
    
    [JsonPropertyName("Album")]
    public Album? Album { get; set; }    
    
    [JsonPropertyName("Genre")]
    public MusicGenre? Genre { get; set; }
    
    [JsonPropertyName("ChunksCount")]
    public int ChunksCount { get; set; }
}
public static class SongMapper
{
    public static SongDto ToDto(this Song song)
    {
        return new SongDto()
        {
            Id = song.Id.ToString(),
            Album = song.Album,
            AlbumId = song.AlbumId.ToString(),
            Author = song.Author,
            AuthorId = song.AuthorId.ToString(),
            ChunksCount = song?.Metadata?.Chunks?.Count ?? 0,
            Genre = song!.Genre,
            Name = song!.Name
        };
    } 
} 