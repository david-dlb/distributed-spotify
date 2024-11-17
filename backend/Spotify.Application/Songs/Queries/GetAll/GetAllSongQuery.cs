using System.Text.RegularExpressions;
using ErrorOr;
using MediatR;
using Spotify.Application.Common.Interfaces;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Songs.Queries.GetAll
{
    public class GetAllSongQuery(PaginationModel pagination, SongFilterModel filter) : IRequest<ErrorOr<List<Song>>>
    {
        public PaginationModel Pagination { get; set; } = pagination;
        public SongFilterModel Filter { get; set; } = filter;
    }

    public class GetAllSongQueryHandler(ISongRepository songRepository) : IRequestHandler<GetAllSongQuery, ErrorOr<List<Song>>>
    {
        private readonly ISongRepository _songRepository = songRepository;

        public async Task<ErrorOr<List<Song>>> Handle(GetAllSongQuery request, CancellationToken cancellationToken)
        {
            var result = await _songRepository.GetAll(request.Pagination,(x) => SimpleFilterFunc(request.Filter,x), cancellationToken); 
            return result;
        }

        private static bool SimpleFilterFunc(SongFilterModel model, Song song)
        {
            // Simple and efficient enough
            if(model.Id != null && song.Id != model.Id)
                return false; 
            if(model.AuthorId != null && song.AuthorId != model.AuthorId)
                return false; 
            if(model.AlbumId != null && song.AlbumId != model.AlbumId)
                return false; 
            if(model.Genre != null && song.Genre != model.Genre)
                return false; 
            if(model.Pattern != null && !Regex.IsMatch(song.Name, model.Pattern))
                return false; 
            return true; 
        }
    }
}