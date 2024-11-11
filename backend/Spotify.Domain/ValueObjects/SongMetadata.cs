using Spotify.Domain.Common;

namespace Spotify.Domain.ValueObjects
{
    public class SongMetadata(long bytesLength) : ValueObject
    {
        public long BytesLength { get; private set; } = bytesLength;
        public override IEnumerable<object> GetEqualityComponents()
        {
            yield return BytesLength;
        }
    }
}