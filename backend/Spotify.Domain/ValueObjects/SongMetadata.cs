using Spotify.Domain.Common;

namespace Spotify.Domain.ValueObjects
{
    [Serializable]
    public class SongMetadata : ValueObject
    {
        public long FrameCount { get; private set; }  
        public List<long> FrameSizes { get; private set; }
        public List<ChunkRange> Chunks { get; set; }
        public long BytesLength { get; private set; }

        public SongMetadata() { }

        public SongMetadata(long bytesLength, long frameCount, List<long> frameSizes, List<ChunkRange> chunks)
        {
            BytesLength = bytesLength;
            FrameCount = frameCount;
            FrameSizes = frameSizes ?? throw new ArgumentNullException(nameof(frameSizes));
            Chunks = chunks ?? throw new ArgumentNullException(nameof(chunks));
        }

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