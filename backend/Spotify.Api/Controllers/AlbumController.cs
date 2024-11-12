using ErrorOr;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Albums.Commands.Create;
using Spotify.Application.Albums.Commands.Delete;
using Spotify.Application.Albums.Queries.GetAll;
using Spotify.Application.Common.Models;
using Spotify.Domain.Entities;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlbumController(IMediator mediator) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;

        [HttpGet]
        public async Task<CommonResponse<List<Album>>> GetAll(
            [FromQuery]int page,
            [FromQuery]int limit,
            [FromQuery] string? pattern
        )
        {
            Log.Information("[GET ALL] Albums endpoint called.");
            var albumsResult = await _mediator.Send(
                new GetAllAlbumQuery(
                    new PaginationModel(page,limit),
                    new AlbumFilterModel(){
                        Pattern = pattern
                    } ), default);
            if (albumsResult.IsError)
            {
                Log.Error("Error trying to get the albums.");               
                return Fail("Error retrieving all albums",albumsResult); 
            }
            return Ok(albumsResult.Value);
        }

        
        [HttpPost]
        public async Task<CommonResponse<Album>> Create(CreateAlbumCommand input)
        {
            Log.Information("[CREATE] Album endpoint called.");

            var albumsResult = await _mediator.Send(input , default);
            
            if (albumsResult.IsError)
            {
                Log.Error("Error trying to create an album.");
                return Fail("Error creating the album.",albumsResult); 
            }
            return Ok(albumsResult.Value);
        }
        
        [HttpDelete]
        public async Task<CommonResponse<Success>> Delete([FromQuery] Guid AlbumId)
        {
            Log.Information("[DELETE] Album endpoint called.");
            var albumsResult = await _mediator.Send(new DeleteAlbumCommand(){
                    Id = AlbumId
                }, default);
            if (albumsResult.IsError)
            {
                Log.Error("Error trying to delete an album.");
                return Fail("Error deleting the album.",albumsResult); 
            }
            return Ok(albumsResult.Value);
        }
    }
}