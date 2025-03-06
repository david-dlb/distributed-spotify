using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces;
using Spotify.Domain.Common.Interfaces;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

namespace Spotify.Application.Songs.Commands.Update
{
    public class UpdateSongCommand() : IRequest<ErrorOr<Song>>
    {
        public required Guid Id { get; init; }
        public Guid? AlbumId { get; init; }
        public Guid? AuthorId { get; init; }
        public MusicGenre? Genre { get; init; }
        public string? Name { get; init; }
        public DateTime? DeletedAt { get; init; }
    }

    public class UpdateSongCommandHandler(ISongRepository songRepository, IDateTimeProvider dateTimeProvider) : IRequestHandler<UpdateSongCommand,ErrorOr<Song>>
    {
        private readonly ISongRepository _songRepository = songRepository;
        private readonly IDateTimeProvider _dateTimeProvider = dateTimeProvider;

        public async Task<ErrorOr<Song>> Handle(UpdateSongCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Updating song with id {request.Id}"); 
            var songResult = await _songRepository.GetById(request.Id); 
            if(songResult.IsError)
            {
                Log.Logger.Error($"Error retrieving the song with id {request.Id}.");
                return songResult; 
            }

            var song = songResult.Value; 
            song.Update(_dateTimeProvider, request.Name ,request.AlbumId,request.AuthorId,request.Genre, request.DeletedAt);            

            var result = await _songRepository.Update(song);
            if (result.IsError) 
            {
                Log.Error("Error saving the song in database.");
                return result; 
            }
            Log.Information("Song saved in database."); 
            return result; 
        }
    }
}