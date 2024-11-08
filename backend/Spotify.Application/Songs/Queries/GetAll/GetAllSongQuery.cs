using ErrorOr;
using MediatR;
using Spotify.Application.Common.Interfaces;
using Spotify.Domain.Entities;

namespace Spotify.Application.Songs.Queries.GetAll
{
    public class GetAllSongQuery() : IRequest<ErrorOr<List<Song>>>
    {
        public required PaginationModel Pagination { get; set; }
    }

    public class GetAllSongQueryHandler(ISongRepository songRepository) : IRequestHandler<GetAllSongQuery, ErrorOr<List<Song>>>
    {
        private readonly ISongRepository _songRepository = songRepository;

        public async Task<ErrorOr<List<Song>>> Handle(GetAllSongQuery request, CancellationToken cancellationToken)
        {
            var result = await _songRepository.GetAll(request.Pagination); 
            return result;
        }
    }
}