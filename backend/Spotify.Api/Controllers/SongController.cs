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
using Spotify.Application.Songs.Queries.GetChunkIndexed;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;
using Spotify.Domain.ValueObjects;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController(IMediator mediator) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;

        [HttpGet]
        public async Task<CommonResponse<List<SongDto>>> GetAll(
            [FromQuery]int page,
            [FromQuery]int limit,
            [FromQuery] Guid? albumId,
            [FromQuery] Guid? authorId,
            [FromQuery] string? pattern,
            [FromQuery] MusicGenre? genre,
            [FromQuery] Guid? id
        )
        {
            Log.Information("[GET ALL] Songs endpoint called.");
            var songsResult = await _mediator.Send(
                new GetAllSongQuery(
                    new PaginationModel(page,limit),
                    new SongFilterModel(){
                        AlbumId = albumId, 
                        AuthorId = authorId,
                        Pattern = pattern,
                        Id = id,
                        Genre = genre
                    } ), default);
            if (songsResult.IsError)
            {
                Log.Error("Error trying to get the songs.");               
                return Fail<List<SongDto>>("Error retrieving all songs"); 
            }
            return Ok(songsResult.Value.Select(x => x.ToDto()).ToList());
        }

        
        [HttpPost]
        public async Task<CommonResponse<SongDto>> Create(IFormFile songFile, [FromForm] CreateSongModel input)
        {
            Log.Information("[CREATE] Song endpoint called.");
            if (songFile == null || songFile.Length == 0)
                return Fail<SongDto>("There is not any file.");

            var songsResult = await _mediator.Send(new CreateSongCommand(){
                AlbumId = input.AlbumId,
                AuthorId = input.AuthorId,
                Genre = input.Genre,
                Name = input.Name ?? songFile.FileName,
                Stream = songFile.OpenReadStream()
            }, default);
            
            if (songsResult.IsError)
            {
                Log.Error("Error trying to create a song.");
                return Fail<SongDto>("Error creating the song."); 
            }
            return Ok(songsResult.Value.ToDto());
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

        [HttpGet("download/indexed")]
        public async Task<IActionResult> DownloadSongChunkIndexed([FromQuery] Guid songId, [FromQuery] int index)
        {
            Log.Information("[DOWNLOAD] Song endpoint called.");
            var result = await _mediator.Send(
                new GetChunkIndexedSongQuery(songId, index),
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
                Log.Error("Error trying to delete a song.");
                return Fail("Error deleting the song.",songsResult); 
            }
            return Ok(songsResult.Value);
        }
    }
}