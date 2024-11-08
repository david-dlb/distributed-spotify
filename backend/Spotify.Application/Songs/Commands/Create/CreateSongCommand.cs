using ErrorOr;
using MediatR;
using Spotify.Application.Common.Interfaces;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;

namespace Spotify.Application.Songs.Commands.Create
{
    public class CreateSongCommand() : IRequest<ErrorOr<bool>>
    {
        public Guid? AlbumId { get; init; }
        public Guid? AuthorId { get; init; }
        public MusicGenre? Genre { get; init; }
        public required string Name { get; init; }
    }

    public class CreateSongCommandHandler(ISongRepository songRepository) : IRequestHandler<CreateSongCommand,ErrorOr<bool>>
    {
        private readonly ISongRepository _songRepository = songRepository;

        public async Task<ErrorOr<bool>> Handle(CreateSongCommand request, CancellationToken cancellationToken)
        {
            var song = Song.Create(request.Name,request.AlbumId,request.AuthorId,request.Genre);
            var result = await _songRepository.Save(song);
            return result; 
        }
    }
}