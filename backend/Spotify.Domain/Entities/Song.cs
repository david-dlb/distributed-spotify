using Spotify.Domain.Common;
using Spotify.Domain.Enums;

namespace Spotify.Domain.Entities
{
    public class Song : AggregateRoot
    {
        public string Name { get; private set; }
        public Guid? AuthorId { get; private set; }
        public Guid? AlbumId { get; private set; }
        public MusicGenre Genre { get; private set; }
        private Song(string name,Guid? album, Guid? author,MusicGenre genre)
        {
            Name = name;
            AlbumId = album;
            AuthorId = author;
            Genre = genre;
        }
        public static Song Create(string name, Guid? albumId, Guid? authorId, MusicGenre? genre ){
            return new Song(name, albumId, authorId, genre ?? MusicGenre.Unknown);
        }
    }
}