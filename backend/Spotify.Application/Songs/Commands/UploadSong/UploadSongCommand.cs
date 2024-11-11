using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Domain.ValueObjects;

namespace Spotify.Application.Songs.Commands.UploadSong
{
    public class UploadSongCommand() : IRequest<ErrorOr<Success>>
    {
        public required Guid SongId { get; init; }

        public required Stream Stream { get; init; }
        public required SongMetadata Metadata { get; init; }
    }

    public class UploadSongCommandHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<UploadSongCommand,ErrorOr<Success>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<Success>> Handle(UploadSongCommand request, CancellationToken cancellationToken)
        {
            var songResult = await _songRepository.GetById(request.SongId);
            if (songResult.IsError)
            {
                Log.Error($"Song not found with id {request.SongId}.");
                return Error.NotFound($"Song with id {request.SongId} not found."); 
            }
            var fileSaveResult = await _storageService.SaveFileAsync(request.SongId.ToString(),request.Stream, cancellationToken); 
            
            if (fileSaveResult.IsError)
            {
                Log.Error($"Error at storage service trying to save a file.");
                // TODO: Handle this 
            }
            
            var song = songResult.Value; 
            song!.SetAsHealthy(request.Metadata); 
            await _songRepository.Save(song);
            Log.Information("Song uploaded successfully.");
            return Result.Success; 
        }
    }
}