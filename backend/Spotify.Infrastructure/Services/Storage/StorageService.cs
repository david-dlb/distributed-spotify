using ErrorOr;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Application.Common.Models;
using NAudio.Wave;
using Spotify.Domain.ValueObjects;


namespace Spotify.Infrastructure.Services.Storage
{
    public class StorageService : IStorageService
    {
        public ErrorOr<Success> DeleteFile(string id)
        {
            var filePath = Path.Combine("../Spotify.Infrastructure/Persistence/Uploads", id);

            if (!File.Exists(filePath))
            {
                return Error.NotFound();
            }
            File.Delete(filePath);
            return Result.Success;
        }

        public async Task<ErrorOr<byte[]>> ReadFileAsync(string id, ChunkRange range, CancellationToken ct)
        {
            var filePath = Path.Combine("../Spotify.Infrastructure/Persistence/Uploads", id);

            if (!File.Exists(filePath))
            {
                return Error.NotFound();
            }

            long start = range.Start, end = range.End;
            var chunkSize = (int)(end - start + 1);
            var buffer = new byte[chunkSize];
            using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                fileStream.Seek(start, SeekOrigin.Begin);
                await fileStream.ReadAsync(buffer.AsMemory(0, chunkSize), ct);
            }
            return buffer;
        }


        public async Task<ErrorOr<SongMetadata>> SaveFileAsync(string id, Stream data, CancellationToken ct)
        {
            // Create a temporal MemoryStream
            SongMetadata metadata;
            using (var memoryStream = new MemoryStream())
            {
                await data.CopyToAsync(memoryStream, ct);
                memoryStream.Position = 0;
                metadata = AnalyzeMp3Frames(memoryStream);

                var filePath = Path.Combine("../Spotify.Infrastructure/Persistence/Uploads", id);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    memoryStream.Position = 0;
                    await memoryStream.CopyToAsync(fileStream, ct);
                }
            }

            return metadata;
        }

        private SongMetadata AnalyzeMp3Frames(Stream data)
        {
            List<long> framesSizes = new List<long>();
            List<ChunkRange> chunks = new List<ChunkRange>();

            int frameCount = 0;
            long start = 0, currentChunkSize = 0;

            using (var mp3Reader = new Mp3FileReader(data))
            {
                Mp3Frame frame;
                while ((frame = mp3Reader.ReadNextFrame()) != null)
                {
                    int frameSize = frame.FrameLength;
                    framesSizes.Add(frameSize);
                    frameCount++;

                    currentChunkSize += frameSize;

                    if (currentChunkSize >= 1000 * 1024)
                    {
                        long end = start + currentChunkSize - 1;
                        chunks.Add(new ChunkRange(start, end));
                        start = end + 1;
                        currentChunkSize = 0;
                    }
                }
                if (currentChunkSize > 0)
                {
                    long end = start + currentChunkSize - 1;
                    chunks.Add(new ChunkRange(start, end));
                }
            }

            return new SongMetadata(data.Length, frameCount, framesSizes, chunks);
        }
    }
}




