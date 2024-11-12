using ErrorOr;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Authors.Commands.Create;
using Spotify.Application.Authors.Commands.Delete;
using Spotify.Application.Authors.Queries.GetAll;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorController(IMediator mediator) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;

        [HttpGet]
        public async Task<CommonResponse<List<Author>>> GetAll(
            [FromQuery]int page,
            [FromQuery]int limit,
            [FromQuery] string? pattern
        )
        {
            Log.Information("[GET ALL] Authors endpoint called.");
            var authorsResult = await _mediator.Send(
                new GetAllAuthorQuery(
                    new PaginationModel(page,limit),
                    new AuthorFilterModel(){
                        Pattern = pattern
                    } ), default);
            if (authorsResult.IsError)
            {
                Log.Error("Error trying to get the authors.");               
                return Fail("Error retrieving all authors",authorsResult); 
            }
            return Ok(authorsResult.Value);
        }

        
        [HttpPost]
        public async Task<CommonResponse<Author>> Create(CreateAuthorCommand input)
        {
            Log.Information("[CREATE] Author endpoint called.");

            var authorsResult = await _mediator.Send(input , default);
            
            if (authorsResult.IsError)
            {
                Log.Error("Error trying to create an author.");
                return Fail("Error creating the author.",authorsResult); 
            }
            return Ok(authorsResult.Value);
        }
        
        [HttpDelete]
        public async Task<CommonResponse<Success>> Delete([FromQuery] Guid AuthorId)
        {
            Log.Information("[DELETE] Author endpoint called.");
            var authorsResult = await _mediator.Send(new DeleteAuthorCommand(){
                    Id = AuthorId
                }, default);
            if (authorsResult.IsError)
            {
                Log.Error("Error trying to delete an author.");
                return Fail("Error deleting the author.",authorsResult); 
            }
            return Ok(authorsResult.Value);
        }
    }
}