using Spotify.Domain.Common;

namespace Spotify.Domain.Entities
{
    public class Album : Entity
    {
        public string Name { get; private set; }
        private Album(string name)
        {   
            Name = name;
        }
        public static Album Create(string name)
        {
            return new Album(name);
        }
    }
}