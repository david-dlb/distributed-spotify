using Spotify.Domain.Common;

namespace Spotify.Domain.ValueObjects
{
    public class SongMetadata(long bytesLength, long frameCount, List<long> frameSizes, List<ChunkRange> chunks) : ValueObject
    {
        public long FrameCount { get; private set; } = frameCount;  
        public List<long> FrameSizes { get; private set; } = frameSizes;
        public List<ChunkRange> Chunks { get; private set; } = chunks;
        public long BytesLength { get; private set; } = bytesLength;

        public override IEnumerable<object> GetEqualityComponents()
        {
            yield return BytesLength;
            yield return FrameCount;
            foreach ( var i in FrameSizes)
            { 
                yield return i;
            }
        }
    }
}