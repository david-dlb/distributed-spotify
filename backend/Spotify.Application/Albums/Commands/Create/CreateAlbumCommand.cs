using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Domain.Entities;

namespace Spotify.Application.Albums.Commands.Create
{
    public class CreateAlbumCommand() : IRequest<ErrorOr<Album>>
    {
        public required string Name { get; init; }
    }

    public class CreateAlbumCommandHandler(IAlbumRepository AlbumRepository) : IRequestHandler<CreateAlbumCommand,ErrorOr<Album>>
    {
        private readonly IAlbumRepository _albumRepository = AlbumRepository;

        public async Task<ErrorOr<Album>> Handle(CreateAlbumCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Adding Album with name {request.Name}"); 
            var album = Album.Create(request.Name);            
            var result = await _albumRepository.Save(album, cancellationToken);
            Log.Information("Album saved in database."); 
            return result; 
        }
    }
}