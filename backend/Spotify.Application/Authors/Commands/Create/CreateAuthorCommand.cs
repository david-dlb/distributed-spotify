using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces.Repositories;
using Spotify.Domain.Entities;

namespace Spotify.Application.Authors.Commands.Create
{
    public class CreateAuthorCommand() : IRequest<ErrorOr<Author>>
    {
        public required string Name { get; init; }
    }

    public class CreateAuthorCommandHandler(IAuthorRepository AuthorRepository) : IRequestHandler<CreateAuthorCommand,ErrorOr<Author>>
    {
        private readonly IAuthorRepository _AuthorRepository = AuthorRepository;

        public async Task<ErrorOr<Author>> Handle(CreateAuthorCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Adding author with name {request.Name}"); 
            var author = Author.Create(request.Name);            
            var result = await _AuthorRepository.Save(author, cancellationToken);
            Log.Information("Author saved in database."); 
            return result; 
        }
    }
}