using Spotify.Domain.Common;

namespace Spotify.Domain.ValueObjects
{
    public class ChunkRange(long start, long end) : ValueObject
    {
        public long Start  { get; private set; } = start;
        public long End  { get; private set; } = end;
        public override IEnumerable<object> GetEqualityComponents()
        {
            yield return Start; 
            yield return End; 
        }
    }
}