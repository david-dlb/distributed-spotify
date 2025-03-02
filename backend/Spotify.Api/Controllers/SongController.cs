using ErrorOr;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Spotify.Api.Controllers.Common;
using Spotify.Application.Common.Models;
using Spotify.Application.Models;
using Spotify.Application.Songs.Commands.Delete;
using Spotify.Application.Songs.Commands.Update;
using Spotify.Application.Songs.Queries.GetAll;
using Spotify.Application.Songs.Queries.GetFull;
using Spotify.Domain.Entities;
using Spotify.Domain.Enums;
using Spotify.Infrastructure.Services.Chord;

namespace Spotify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController(IMediator mediator, IChordManagerService chordManagerService) : SpotifyControllerBase
    {
        private readonly IMediator _mediator = mediator;

        private readonly IChordManagerService _chordManagerService = chordManagerService;

        [HttpGet]
        public async Task<CommonResponse<List<SongDto>>> GetAll(
            [FromQuery]int page,
            [FromQuery]int limit,
            [FromQuery] Guid? albumId,
            [FromQuery] Guid? authorId,
            [FromQuery] string? pattern,
            [FromQuery] MusicGenre? genre,
            [FromQuery] Guid? id,
            [FromQuery] int? nodeId
        )
        {
            // TODO: 
            Log.Information("[GET ALL] Songs endpoint called.");
            
            var songsResult = await _chordManagerService.GetAll(nodeId, new PaginationModel(page, limit)); 
            if (songsResult.IsError)
            {
                Log.Error("Error trying to get the songs.");               
                return Fail<List<SongDto>>("Error retrieving all songs"); 
            }
            return Ok(songsResult.Value);
        }

        
        [HttpPost]
        public async Task<CommonResponse<SongDto>> Create(IFormFile songFile, [FromForm] CreateSongModel input)
        {
            // DONE
            Log.Information("[CREATE] Song endpoint called.");
            if (songFile == null || songFile.Length == 0)
                return Fail<SongDto>("There is not any file.");

            using var stream = songFile.OpenReadStream();

            var songDto = await _chordManagerService.StoreDataAsync(
                (input.Id ?? Guid.NewGuid()).ToString(),
                new CreateSongData()
                {
                    Model = input,
                    SongFileStream = stream
                }
            );
            return Ok(songDto);
        }

        [HttpGet("download/indexed")]
        public async Task<IActionResult> DownloadSongChunkIndexed([FromQuery] Guid songId, [FromQuery] int index)
        {
            // DONE
            Log.Information("[DOWNLOAD] Song endpoint called.");
            var result = await _chordManagerService.GetDataAsync(songId.ToString(), index);

            if (result.IsError){
                Log.Error("Error trying to download the file song.");
                return Problem();
            }
            return File(result.Value, "application/octet-stream", enableRangeProcessing: true);
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadFullSong([FromQuery] Guid songId)
        {
            // DONE
            Log.Information("[DOWNLOAD LOCAL] Song endpoint called.");
            var result = await _mediator.Send(
                new GetFullSongQuery(songId),
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
            // DONE
            Log.Information("[UPDATE] Song endpoint called.");
            var songsResult = await _chordManagerService.UpdateDataAsync(input);
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
            // DONE
            Log.Information("[DELETE] Song endpoint called.");
            var songsResult = await _chordManagerService.DeleteDataAsync(
                new DeleteSongCommand(){
                    Id = songId
                }
            );
            if (songsResult.IsError)
            {
                Log.Error("Error trying to delete a song.");
                return Fail("Error deleting the song.",songsResult); 
            }
            return Ok(songsResult.Value);
        }
    }
}