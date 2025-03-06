using Spotify.Domain.Common;
using Spotify.Domain.Common.Interfaces;
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
        public DateTime? DeletedAt { get;  set; }
        public DateTime? UpdatedAt { get;  set; }
      
        // Needed for EF
        public Song() { }
        private Song(IDateTimeProvider dateTimeProvider, string name,Guid? album, Guid? author,MusicGenre genre, Guid? id = null, DateTime? deletedAt = null)
        {
            Name = name ?? "UNKNOWN";
            AlbumId = album;
            AuthorId = author;
            Genre = genre;
            Id = id ?? Guid.NewGuid();     
            DeletedAt = deletedAt; 
            UpdatedAt = dateTimeProvider.UtcNow; 
        }
        public static Song Create(IDateTimeProvider dateTimeProvider,string name, Guid? albumId, Guid? authorId, MusicGenre? genre, Guid? id = null, DateTime? deletedAt = null){
            return new Song(dateTimeProvider,name, albumId, authorId, genre ?? MusicGenre.Unknown, id, deletedAt);
        }

        public void Update(IDateTimeProvider dateTimeProvider,string? name, Guid? albumId, Guid? authorId, MusicGenre? genre, DateTime? deletedAt)
        {
            Name = name ?? Name;  
            AlbumId = albumId ?? AlbumId;
            AuthorId = authorId ?? AuthorId; 
            Genre = genre ?? Genre; 
            DeletedAt = deletedAt ?? DeletedAt; 
            UpdatedAt = dateTimeProvider.UtcNow; 
        }

        public void SetMetadata(SongMetadata metadata)
        {
            Metadata = metadata; 
        }

        public void Delete(IDateTimeProvider dateTimeProvider)
        {
            DeletedAt = DateTime.Now; 
            UpdatedAt = dateTimeProvider.UtcNow; 
        }
        public bool IsDiff(Song other){
            var isDiff = (
                other.Id != Id || 
                other.AlbumId != AlbumId || 
                other.AuthorId != AuthorId || 
                other.DeletedAt != DeletedAt || 
                other.Name != Name || 
                other.Genre != Genre
            ); 
            return isDiff; 
        }
    }
}