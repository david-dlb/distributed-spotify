using Spotify.Domain.Common;

namespace Spotify.Domain.Entities
{
    public class Album : Entity
    {
        public string Name { get; private set; }
        private Album(string name)
        {   
            Name = name;
            Id = Guid.NewGuid();
        }
        public static Album Create(string name)
        {
            return new Album(name);
        }
        // Needed for EF
        public Album() {}
    }
}