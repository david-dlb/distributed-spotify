using System.Text.RegularExpressions;
using ErrorOr;
using MediatR;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Application.Authors.Queries.GetAll
{
    public class GetAllAuthorQuery(PaginationModel pagination, AuthorFilterModel filter) : IRequest<ErrorOr<List<Author>>>
    {
        public PaginationModel Pagination { get; set; } = pagination;
        public AuthorFilterModel Filter { get; set; } = filter;
    }

    public class GetAllAuthorQueryHandler(IAuthorRepository AuthorRepository) : IRequestHandler<GetAllAuthorQuery, ErrorOr<List<Author>>>
    {
        private readonly IAuthorRepository _AuthorRepository = AuthorRepository;

        public async Task<ErrorOr<List<Author>>> Handle(GetAllAuthorQuery request, CancellationToken cancellationToken)
        {
            var result = await _AuthorRepository.GetAll(request.Pagination,(x) => SimpleFilterFunc(request.Filter,x), cancellationToken); 
            return result;
        }
        private static bool SimpleFilterFunc(AuthorFilterModel model, Author Author)
        {
            // Simple and efficient enough
            if(model.Pattern != null && !Regex.IsMatch(Author.Name, model.Pattern))
                return false; 
            return true; 
        }
    }
}