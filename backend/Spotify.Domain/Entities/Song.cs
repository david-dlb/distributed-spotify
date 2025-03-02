using System.Runtime.Serialization;
using Spotify.Domain.Common;
using Spotify.Domain.Enums;
using Spotify.Domain.ValueObjects;

namespace Spotify.Domain.Entities
{
    public class Song : AggregateRoot
    {
        public string? Name { get; set; }
        public Guid? AuthorId { get; private set; }
        public Author? Author { get; private set; }    
        public Guid? AlbumId { get; private set; }
        public Album? Album { get; private set; }    
        public MusicGenre Genre { get; private set; }
        public SongMetadata? Metadata { get; private set; }
        public DateTime? DeletedAt { get; private set; }
      
        // Needed for EF
        public Song() { }
        private Song(string name,Guid? album, Guid? author,MusicGenre genre, Guid? id = null, DateTime? deletedAt = null)
        {
            Name = name ?? "UNKNOWN";
            AlbumId = album;
            AuthorId = author;
            Genre = genre;
            Id = id ?? Guid.NewGuid();     
            DeletedAt = deletedAt; 
        }
        public static Song Create(string name, Guid? albumId, Guid? authorId, MusicGenre? genre, Guid? id = null, DateTime? deletedAt = null){
            return new Song(name, albumId, authorId, genre ?? MusicGenre.Unknown, id, deletedAt);
        }

        public void Update(string? name, Guid? albumId, Guid? authorId, MusicGenre? genre, DateTime? deletedAt)
        {
            Name = name ?? Name;  
            AlbumId = albumId ?? AlbumId;
            AuthorId = authorId ?? AuthorId; 
            Genre = genre ?? Genre; 
            DeletedAt = deletedAt ?? DeletedAt; 
        }

        public void SetMetadata(SongMetadata metadata)
        {
            Metadata = metadata; 
        }

        public void Delete()
        {
            DeletedAt = DateTime.Now; 
        }
        public bool IsDiff(Song other){
            return (
                other.Id != Id || 
                other.AlbumId != AlbumId || 
                other.AuthorId != AuthorId || 
                other.DeletedAt != DeletedAt || 
                other.Name != Name || 
                other.Genre != Genre
            ); 
        }
    }
}