using ErrorOr;
using MediatR;
using Serilog;
using Spotify.Application.Common.Interfaces.Repositories;

namespace Spotify.Application.Authors.Commands.Delete
{
    public class DeleteAuthorCommand : IRequest<ErrorOr<Success>>
    {
        public required Guid Id { get; init; }
    }

    public class DeleteAuthorCommandHandler(IAuthorRepository AuthorRepository) : IRequestHandler<DeleteAuthorCommand,ErrorOr<Success>>
    {
        private readonly IAuthorRepository _AuthorRepository = AuthorRepository;

        public async Task<ErrorOr<Success>> Handle(DeleteAuthorCommand request, CancellationToken cancellationToken)
        {
            Log.Information($"Deleting author with id {request.Id}"); 
            var AuthorResult = await _AuthorRepository.GetById(request.Id, cancellationToken); 
            if(AuthorResult.IsError)
            {
                Log.Logger.Error($"Error retrieving the Author with id {request.Id}.");
                return AuthorResult.FirstError; 
            }
                        
            var result = await _AuthorRepository.Delete(request.Id, cancellationToken);
            if (result.IsError) 
            {
                Log.Error("Error deleting the author from database.");
                return result; 
            }
            Log.Information("Author deleted successfully."); 
            return result; 
        }
    }
}