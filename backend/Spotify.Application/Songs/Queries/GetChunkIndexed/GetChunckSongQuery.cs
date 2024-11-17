using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Domain.ValueObjects;

namespace Spotify.Application.Songs.Queries.GetChunkIndexed
{
    public class GetChunkIndexedSongQuery(Guid songId, int index) : IRequest<ErrorOr<byte[]>>
    {
        public int Index { get; set; } = index;
        public Guid SongId { get; set; } = songId;
    }

    public class GetChunkIndexedSongQueryHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<GetChunkIndexedSongQuery, ErrorOr<byte[]>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<byte[]>> Handle(GetChunkIndexedSongQuery request, CancellationToken cancellationToken)
        {
            var songResult = await _songRepository.GetById(request.SongId);
            if (songResult.IsError)
            {
                Log.Error($"Error retrieving song with id {request.SongId}.");
                // TODO: handle 
            }
            var range = songResult.Value.Metadata!.Chunks[request.Index]; 

            var data = await _storageService.ReadFileAsync(request.SongId.ToString(),range,cancellationToken);
            if (data.IsError)
            {
                Log.Error($"Error reading file from storage service with id {request.SongId}.");
                // TODO: handle 
            }
            return data.Value;
        }
    }
}