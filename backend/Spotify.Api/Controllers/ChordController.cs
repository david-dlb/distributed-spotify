using Microsoft.AspNetCore.Mvc;
using Spotify.Infrastructure.Services.Chord;

namespace Spotify.WebAPI.Controllers
{
    [ApiController]
    [Route("api/chord")]
    public class ChordController : ControllerBase
    {
        private readonly IChordManagerService _chordService;

        public ChordController(IChordManagerService chordService)
        {
            _chordService = chordService;
        }

        [HttpGet("find-successor")]
        public async Task<ActionResult<string>> FindSuccessor(int id)
        {
            return Ok(await _chordService.FindSuccessorAsync(id));
        }

        [HttpPost("notify")]
        public async Task<IActionResult> Notify([FromQuery] string nodeUrl)
        {
            await _chordService.HandShakeAsync(nodeUrl);
            return Ok();
        }

        [HttpGet("predecessor")]
        public async Task<ActionResult<string>> GetPredecessor()
        {
            return Ok(await _chordService.GetPredecessor());
        }

        [HttpPost("store/{key}")]
        public async Task<IActionResult> Store(string key, [FromBody] string value)
        {
            var nodeUrl = await _chordService.StoreDataAsync(key, value);
            return Ok(new StoreDataResponse(nodeUrl,key));
        }

        [HttpGet("data/{key}")]
        public async Task<IActionResult> Get(string key)
        {
            var value = await _chordService.GetDataAsync(key);
            return Ok(value);
        }
        
        [HttpGet("alive")]
        public async Task<IActionResult> IsAlive()
        {
            return await Task.FromResult(Ok());
        }
    }
}