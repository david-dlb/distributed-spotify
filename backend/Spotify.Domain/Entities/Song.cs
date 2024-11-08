using Spotify.Domain.Common;
using Spotify.Domain.Enums;

namespace Spotify.Domain.Entities
{
    public class Song : AggregateRoot
    {
        public string Name { get; private set; }
        public Author? Author { get; private set; }
        public Album? Album { get; private set; }
        public MusicGenre Genre { get; private set; }
        private Song(string name,Album? album, Author? author,MusicGenre genre)
        {
            Name = name;
            Album = album;
            Author = author;
            Genre = genre;
        }
        static Song Create(string name, Album? album, Author? author,MusicGenre genre = MusicGenre.Unknown){
            return new Song(name, album, author, genre);
        }
    }
}