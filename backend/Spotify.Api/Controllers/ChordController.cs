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

        // [HttpPost("store/{key}")]
        // public async Task<IActionResult> Store(string key, [FromBody] string value)
        // {
        //     var response = await _chordService.StoreDataAsync(key, value);
        //     return Ok(response);
        // }

        [HttpGet("data/{key}")]
        public async Task<IActionResult> Get(string key)
        {
            var value = await _chordService.GetDataAsync(key);
            return Ok(value);
        }

        [HttpGet("data/local/{key}")]
        public async Task<IActionResult> GetLocal(string key)
        {
            var value = await _chordService.GetLocalDataAsync(key);
            return Ok(value);
        }

        [HttpGet("alive")]
        public async Task<IActionResult> IsAlive()
        {
            return await Task.FromResult(Ok());
        }

        [HttpPost("catalog/{ip}")]
        public async Task<IActionResult> ReceiveCatalog([FromBody] DataCatalog catalog, string ip)
        {
            await _chordService.ProcessCatalog(catalog, ip);
            return Ok();
        }

        [HttpGet("catalog")]
        public async Task<IActionResult> ExportCatalog()
        {
            var result = await _chordService.GetLocalCatalog();
            return Ok(result);
        }
    }
}