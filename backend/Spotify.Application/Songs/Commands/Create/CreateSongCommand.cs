using ErrorOr;
using MediatR;
using Microsoft.Extensions.Logging;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

namespace Spotify.Application.Songs.Commands.Create
{
    public class CreateSongCommand() : IRequest<ErrorOr<Song>>
    {
        public Guid? AlbumId { get; init; }
        public Guid? AuthorId { get; init; }
        public MusicGenre? Genre { get; init; }
        public required string Name { get; init; }
    }

    public class CreateSongCommandHandler(ISongRepository songRepository, ILogger<CreateSongCommandHandler> logger) : IRequestHandler<CreateSongCommand,ErrorOr<Song>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly ILogger<CreateSongCommandHandler> _logger = logger;

        public async Task<ErrorOr<Song>> Handle(CreateSongCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Adding song with name {request.Name}"); 
            var song = Song.Create(request.Name,request.AlbumId,request.AuthorId,request.Genre);            
            var result = await _songRepository.Save(song);
            Log.Information("Song saved in database"); 
            return result; 
        }
    }
}