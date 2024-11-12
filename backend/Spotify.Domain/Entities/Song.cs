using Spotify.Domain.Common;
using Spotify.Domain.Enums;
using Spotify.Domain.ValueObjects;

namespace Spotify.Domain.Entities
{
    public class Song : AggregateRoot
    {
        public string Name { get; private set; }
        public Guid? AuthorId { get; private set; }
        public Author? Author { get; private set; }    
        public Guid? AlbumId { get; private set; }
        public Album? Album { get; private set; }    
        public MusicGenre Genre { get; private set; }
        public SongMetadata? Metadata { get; private set; }
        
        private Song(string name,Guid? album, Guid? author,MusicGenre genre, SongMetadata? metadata)
        {
            Name = name;
            AlbumId = album;
            AuthorId = author;
            Genre = genre;
            Id = Guid.NewGuid();     
            Metadata = metadata;
        }
        public static Song Create(string name, Guid? albumId, Guid? authorId, MusicGenre? genre, SongMetadata metadata){
            return new Song(name, albumId, authorId, genre ?? MusicGenre.Unknown, metadata);
        }

        public void Update(string? name, Guid? albumId, Guid? authorId, MusicGenre? genre)
        {
            Name = name ?? Name;  
            AlbumId = albumId ?? AlbumId;
            AuthorId = authorId ?? AuthorId; 
            Genre = genre ?? Genre; 
        }
    }
}