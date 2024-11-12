using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Interfaces.Services;

namespace Spotify.Application.Albums.Commands.Delete
{
    public class DeleteAlbumCommand : IRequest<ErrorOr<Success>>
    {
        public required Guid Id { get; init; }
    }

    public class DeleteAlbumCommandHandler(IAlbumRepository AlbumRepository) : IRequestHandler<DeleteAlbumCommand,ErrorOr<Success>>
    {
        private readonly IAlbumRepository _albumRepository = AlbumRepository;

        public async Task<ErrorOr<Success>> Handle(DeleteAlbumCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Deleting album with id {request.Id}"); 
            var albumResult = await _albumRepository.GetById(request.Id, cancellationToken); 
            if(albumResult.IsError)
            {
                Log.Logger.Error($"Error retrieving the Album with id {request.Id}.");
                return albumResult.FirstError; 
            }
                        
            var result = await _albumRepository.Delete(request.Id, cancellationToken);
            if (result.IsError) 
            {
                Log.Error("Error deleting the album from database.");
                return result; 
            }
            Log.Information("Album deleted successfully."); 
            return result; 
        }
    }
}