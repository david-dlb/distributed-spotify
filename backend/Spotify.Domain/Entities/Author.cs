using Spotify.Domain.Common;

namespace Spotify.Domain.Entities
{
    public class Author : Entity
    {
        public string Name { get; private set; }
        private Author(string name)
        {   
            Name = name;
        }
        public static Author Create(string name)
        {
            return new Author(name);
        }
    }
}