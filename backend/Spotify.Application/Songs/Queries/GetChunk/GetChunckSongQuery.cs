using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Application.Common.Models;
using Spotify.Domain.ValueObjects;

namespace Spotify.Application.Songs.Queries.GetChunk
{
    public class GetChunkSongQuery(Guid songId, ChunkRange range) : IRequest<ErrorOr<byte[]>>
    {
        public ChunkRange Range { get; set; } = range;
        public Guid SongId { get; set; } = songId;
    }

    public class GetChunkSongQueryHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<GetChunkSongQuery, ErrorOr<byte[]>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<byte[]>> Handle(GetChunkSongQuery request, CancellationToken cancellationToken)
        {
            var songResult = await _songRepository.GetById(request.SongId);
            if (songResult.IsError)
            {
                Log.Error($"Error retrieving song with id {request.SongId}.");
                // TODO: handle 
            }
            var data = await _storageService.ReadFileAsync(request.SongId.ToString(),request.Range,cancellationToken);
            if (data.IsError)
            {
                Log.Error($"Error reading file from storage service with id {request.SongId}.");
                // TODO: handle 
            }
            return data.Value;
        }
    }
}