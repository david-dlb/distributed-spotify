using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;

namespace Spotify.Application.Songs.Commands.Delete
{
    public class DeleteSongCommand : IRequest<ErrorOr<Success>>
    {
        public required Guid Id { get; init; }
    }

    public class DeleteSongCommandHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<DeleteSongCommand,ErrorOr<Success>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<Success>> Handle(DeleteSongCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Deleting song with id {request.Id}"); 
            var songResult = await _songRepository.GetById(request.Id, cancellationToken); 
            if(songResult.IsError)
            {
                Log.Logger.Error($"Error retrieving the song with id {request.Id}.");
                return songResult.FirstError; 
            }
            
            var storageResult = _storageService.DeleteFile(request.Id.ToString());
            if(storageResult.IsError)
            {
                Log.Logger.Error($"Error retrieving the song with id {request.Id}.");
                return storageResult; 
            }
            
            var result = await _songRepository.Delete(request.Id, cancellationToken);
            if (result.IsError) 
            {
                Log.Error("Error deleting the song from database.");
                return result; 
            }
            Log.Information("Song deleted successfully."); 
            return result; 
        }
    }
}