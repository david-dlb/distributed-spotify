namespace Spotify.Application.Common.Models
{
    public class ChunkRange(long start, long end)
    {
        public readonly long Start = start;
        public readonly long End = end;
    }
}