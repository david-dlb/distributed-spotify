using System.Text.RegularExpressions;
using ErrorOr;
using MediatR;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Albums.Queries.GetAll
{
    public class GetAllAlbumQuery(PaginationModel pagination, AlbumFilterModel filter) : IRequest<ErrorOr<List<Album>>>
    {
        public PaginationModel Pagination { get; set; } = pagination;
        public AlbumFilterModel Filter { get; set; } = filter;
    }

    public class GetAllAlbumQueryHandler(IAlbumRepository AlbumRepository) : IRequestHandler<GetAllAlbumQuery, ErrorOr<List<Album>>>
    {
        private readonly IAlbumRepository _AlbumRepository = AlbumRepository;

        public async Task<ErrorOr<List<Album>>> Handle(GetAllAlbumQuery request, CancellationToken cancellationToken)
        {
            var result = await _AlbumRepository.GetAll(request.Pagination,(x) => SimpleFilterFunc(request.Filter,x), cancellationToken); 
            return result;
        }
        private static bool SimpleFilterFunc(AlbumFilterModel model, Album album)
        {
            // Simple and efficient enough
            if(model.Id != null && model.Id != album.Id)
                return false; 

            if(model.Pattern != null && !Regex.IsMatch(album.Name, model.Pattern))
                return false; 
            return true; 
        }
    }
}