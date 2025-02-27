namespace Spotify.Application.Models
{
    public class CommonResponse<T>
    {
        public bool Success { get; init; }
        public string? ErrorMessage { get; init; }
        public string? ErrorDetails { get; init; }
        public T? Value { get; init; }
    }
}