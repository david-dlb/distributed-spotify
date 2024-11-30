using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;
using Spotify.Domain.ValueObjects;

namespace Spotify.Application.Songs.Commands.Create
{
    public class CreateSongCommand() : IRequest<ErrorOr<Song>>
    {
        public Guid? AlbumId { get; init; }
        public Guid? AuthorId { get; init; }
        public MusicGenre? Genre { get; init; }
        public required string Name { get; init; }
        public required Stream Stream { get; init; }
    }

    public class CreateSongCommandHandler(ISongRepository songRepository, IStorageService storageService) : IRequestHandler<CreateSongCommand,ErrorOr<Song>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IStorageService _storageService = storageService;

        public async Task<ErrorOr<Song>> Handle(CreateSongCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Adding song with name {request.Name}"); 
            var song = Song.Create(request.Name ,request.AlbumId,request.AuthorId,request.Genre);            

            var fileSaveResult = await _storageService.SaveFileAsync(song.Id.ToString(),request.Stream, cancellationToken); 
            if (fileSaveResult.IsError)
            {
                Log.Error($"Error at storage service trying to save a file.");
                // TODO: Handle this 
            }
            song.SetMetadata(fileSaveResult.Value);
            Log.Information("Song uploaded successfully.");

            var result = await _songRepository.Save(song);
            Log.Information("Song saved in database."); 
            return result; 
        }
    }
}