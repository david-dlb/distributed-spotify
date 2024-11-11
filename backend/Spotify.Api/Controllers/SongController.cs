using ErrorOr;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Common.Models;
using Spotify.Application.Songs.Commands.Create;
using Spotify.Application.Songs.Commands.UploadSong;
using Spotify.Application.Songs.Queries.GetAll;
using Spotify.Application.Songs.Queries.GetChunk;
using Spotify.Domain.Entities;
using Spotify.Domain.ValueObjects;

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

        [HttpPost("upload")]
        public async Task<CommonResponse<Success>> UploadSong(IFormFile songFile, [FromQuery] Guid songId)
        {
            _logger.Log(LogLevel.Information,"[UPLOAD] Song endpoint called.");
            if (songFile == null || songFile.Length == 0)
                return Fail<Success>("There is not any file.");

            var result = await _mediator.Send(
                new UploadSongCommand(){
                    SongId = songId, 
                    Stream = songFile.OpenReadStream(), 
                    Metadata = new SongMetadata(songFile.Length)
                },
                default
            );
            if (result.IsError){
                _logger.Log(LogLevel.Error,"Error trying to upload the song file.");
                return Fail("Error retrieving all songs",result); 
            }
            
            return Ok(Result.Success);
        }
        
        [HttpGet("download")]
        public async Task<IActionResult> DownloadSongChunk([FromQuery] Guid songId, [FromQuery] long start, [FromQuery] long end)
        {
            _logger.Log(LogLevel.Information,"[DOWNLOAD] Song endpoint called.");
            var result = await _mediator.Send(
                new GetChunkSongQuery(songId, new ChunkRange(start,end)),
                default
            );
            if (result.IsError){
                _logger.Log(LogLevel.Error,"Error trying to download the file song.");
                return Problem();
            }
            return File(result.Value, "application/octet-stream", enableRangeProcessing: true);
        }
    }
}