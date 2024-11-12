using ErrorOr;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Common.Models;
using Spotify.Application.Songs.Commands.Create;
using Spotify.Application.Songs.Commands.Delete;
using Spotify.Application.Songs.Commands.Update;
using Spotify.Application.Songs.Queries.GetAll;
using Spotify.Application.Songs.Queries.GetChunk;
using Spotify.Domain.Entities;
using Spotify.Domain.ValueObjects;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController(IMediator mediator) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;

        [HttpGet]
        public async Task<CommonResponse<List<Song>>> GetAll([FromQuery]int page, [FromQuery]int limit)
        {
            Log.Information("[GET ALL] Songs endpoint called.");
            var songsResult = await _mediator.Send(new GetAllSongQuery(new PaginationModel(page,limit)), default);
            if (songsResult.IsError)
            {
                Log.Error("Error trying to get the songs.");               
                return Fail("Error retrieving all songs",songsResult); 
            }
            return Ok(songsResult.Value);
        }

        
        [HttpPost]
        public async Task<CommonResponse<Song>> Create(IFormFile songFile, [FromForm] CreateSongModel input)
        {
            Log.Information("[CREATE] Song endpoint called.");
            if (songFile == null || songFile.Length == 0)
                return Fail<Song>("There is not any file.");

            var songsResult = await _mediator.Send(new CreateSongCommand(){
                AlbumId = input.AlbumId,
                AuthorId = input.AuthorId,
                Genre = input.Genre,
                Name = input.Name ?? songFile.FileName,
                Metadata = new SongMetadata(songFile.Length),
                Stream = songFile.OpenReadStream()
            }, default);
            
            if (songsResult.IsError)
            {
                Log.Error("Error trying to create a song.");
                return Fail("Error creating the song.",songsResult); 
            }
            return Ok(songsResult.Value);
        }
        
        [HttpGet("download")]
        public async Task<IActionResult> DownloadSongChunk([FromQuery] Guid songId, [FromQuery] long start, [FromQuery] long end)
        {
            Log.Information("[DOWNLOAD] Song endpoint called.");
            var result = await _mediator.Send(
                new GetChunkSongQuery(songId, new ChunkRange(start,end)),
                default
            );
            if (result.IsError){
                Log.Error("Error trying to download the file song.");
                return Problem();
            }
            return File(result.Value, "application/octet-stream", enableRangeProcessing: true);
        }

        [HttpPut]
        public async Task<CommonResponse<Song>> Update(UpdateSongCommand input)
        {
            Log.Information("[UPDATE] Song endpoint called.");
            var songsResult = await _mediator.Send(input, default);
            if (songsResult.IsError)
            {
                Log.Error("Error trying to update a song.");
                return Fail("Error updating the song.",songsResult); 
            }
            return Ok(songsResult.Value);
        }

        [HttpDelete]
        public async Task<CommonResponse<Success>> Delete([FromQuery] Guid songId)
        {
            Log.Information("[DELETE] Song endpoint called.");
            var songsResult = await _mediator.Send(new DeleteSongCommand(){
                    Id = songId
                }, default);
            if (songsResult.IsError)
            {
                Log.Error("Error trying to update a song.");
                return Fail("Error updating the song.",songsResult); 
            }
            return Ok(songsResult.Value);
        }
    }
}