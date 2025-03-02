using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;

namespace Spotify.Application.Songs.Queries.GetFull
{
    public class GetFullSongQuery(Guid songId) : IRequest<ErrorOr<byte[]>>
    {
        public Guid SongId { get; set; } = songId;
    }

    public class GetFullSongQueryHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<GetFullSongQuery, ErrorOr<byte[]>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<byte[]>> Handle(GetFullSongQuery request, CancellationToken cancellationToken)
        {
            var songResult = await _songRepository.GetById(request.SongId);
            if (songResult.IsError)
            {
                Log.Error($"Error retrieving song with id {request.SongId}.");
                // TODO: handle 
            }

            var data = await _storageService.ReadFileAsync(request.SongId.ToString(),cancellationToken);
            if (data.IsError)
            {
                Log.Error($"Error reading file from storage service with id {request.SongId}.");
                // TODO: handle 
            }
            return data.Value;
        }
    }
}