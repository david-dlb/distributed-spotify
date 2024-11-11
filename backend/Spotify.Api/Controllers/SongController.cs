using MediatR;
using Microsoft.AspNetCore.Mvc;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Common.Models;
using Spotify.Application.Songs.Commands.Create;
using Spotify.Application.Songs.Queries.GetAll;
using Spotify.Domain.Entities;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController(IMediator mediator, ILogger<SongController> logger) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;
        private readonly ILogger<SongController> _logger = logger;

        [HttpGet]
        public async Task<CommonResponse<List<Song>>> GetAll([FromQuery]int page, [FromQuery]int limit)
        {
            _logger.Log(LogLevel.Information,"[GET ALL] Songs endpoint called.");
            var songsResult = await _mediator.Send(new GetAllSongQuery(new PaginationModel(page,limit)), default);
            if (songsResult.IsError)
            {
                _logger.Log(LogLevel.Error,"Error trying to get the songs.");
                return Fail("Error retrieving all songs",songsResult); 
            }
            return Ok(songsResult.Value);
        }

        
        [HttpPost]
        public async Task<CommonResponse<Song>> Create(CreateSongCommand input)
        {
            _logger.Log(LogLevel.Information,"[CREATE] Song endpoint called.");
            var songsResult = await _mediator.Send(input, default);
            if (songsResult.IsError)
            {
                _logger.Log(LogLevel.Error,"Error trying to create a song.");
                return Fail("Error retrieving all songs",songsResult); 
            }
            return Ok(songsResult.Value);
        }
    }
}