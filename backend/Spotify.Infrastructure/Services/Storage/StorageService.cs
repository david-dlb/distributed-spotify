using ErrorOr;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Domain.ValueObjects;

namespace Spotify.Infrastructure.Services.Storage
{
    public class StorageService : IStorageService
    {
        static public string basePath  = "Spotify.Infrastructure/Persistence/Uploads"; 
        
        public ErrorOr<Success> DeleteFile(string id)
        {
            var filePath = Path.Combine(basePath, id);

            if (!File.Exists(filePath))
            {
                return Error.NotFound();
            }
            File.Delete(filePath);
            return Result.Success;
        }

        public async Task<ErrorOr<byte[]>> ReadFileAsync(string id, ChunkRange range, CancellationToken ct)
        {
            var filePath = Path.Combine(basePath, id);

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
            SongMetadata metadata;

            using (var memoryStream = new MemoryStream())
            {
                await data.CopyToAsync(memoryStream, ct);
                memoryStream.Position = 0;
                metadata = AnalyzeMp3Frames(memoryStream);

                var filePath = Path.Combine(basePath, id);
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
            var framesSizes = new List<long>();
            var chunks = new List<ChunkRange>();

            int frameCount = 0;
            long start = 0, currentChunkSize = 0;
            const int chunkSizeLimit = 1000 * 1024;

            if (HasId3Tag(data))
            {
                SkipId3Tag(data);
            }

            while (data.Position < data.Length)
            {
                var frameHeader = new byte[4];
                if (data.Read(frameHeader, 0, 4) < 4 || !IsMp3FrameHeader(frameHeader))
                {
                    break;
                }

                int frameSize = GetMp3FrameSize(frameHeader);
                if (frameSize <= 0 || data.Position + frameSize - 4 > data.Length)
                {
                    break;
                }

                framesSizes.Add(frameSize);
                frameCount++;

                currentChunkSize += frameSize;
                data.Seek(frameSize - 4, SeekOrigin.Current); 

                if (currentChunkSize >= chunkSizeLimit)
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

            return new SongMetadata(data.Length, frameCount, framesSizes, chunks);
        }
        private static bool HasId3Tag(Stream data)
        {
            var tagHeader = new byte[3];
            data.Read(tagHeader, 0, 3);
            data.Seek(-3, SeekOrigin.Current);
            return tagHeader[0] == 0x49 && tagHeader[1] == 0x44 && tagHeader[2] == 0x33;
        }

        private static void SkipId3Tag(Stream data)
        {
            var tagHeader = new byte[10];
            data.Read(tagHeader, 0, 10);

            int tagSize = (tagHeader[6] << 21) | (tagHeader[7] << 14) | (tagHeader[8] << 7) | tagHeader[9];
            data.Seek(tagSize, SeekOrigin.Current);
        }
        private static bool IsMp3FrameHeader(byte[] header)
        {
            return (header[0] == 0xFF) && ((header[1] & 0xE0) == 0xE0);
        }

        private static int GetMp3FrameSize(byte[] header)
        {
            int bitrateIndex = (header[2] >> 4) & 0x0F;
            int samplingRateIndex = (header[2] >> 2) & 0x03;

            int[] bitRates = { 0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0 }; 
            int[] samplingRates = { 44100, 48000, 32000, 0 };

            int bitrate = bitRates[bitrateIndex] * 1000; 
            int samplingRate = samplingRates[samplingRateIndex];

            if (bitrate == 0 || samplingRate == 0)
                return -1;

            int padding = (header[2] & 0x02) >> 1;
            return (144 * bitrate / samplingRate) + padding;
        }
    }
}
