using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace Spotify.Api.Controllers.Common
{
    public class SpotifyControllerBase : ControllerBase
    {
        public static CommonResponse<T> Ok<T>(T value)
        {
            return new CommonResponse<T>()
            {
                Success = true,
                Value = value,
                ErrorMessage = null,
                ErrorDetails = null
            };
        }
        public static CommonResponse<T> Fail<T>(string errorMessage, ErrorOr<T> error)
        {
            return new CommonResponse<T>()
            {
                Success = false,
                Value = default,
                ErrorMessage = errorMessage,
                ErrorDetails = string.Join(";",error.Errors.Select(x => x.Description))
            };
        }
        public static CommonResponse<T> Fail<T>(string errorMessage)
        {
            return new CommonResponse<T>()
            {
                Success = false,
                Value = default(T),
                ErrorMessage = errorMessage,
                ErrorDetails = null
            };
        }
        public static CommonResponse<object?> Fail(string errorMessage)
        {
            return new CommonResponse<object?>()
            {
                Success = false,
                Value = null,
                ErrorMessage = errorMessage,
                ErrorDetails = null
            };
        }
    }
    public class CommonResponse<T>
    {
        public bool Success { get; init; }
        public string? ErrorMessage { get; init; }
        public string? ErrorDetails { get; init; }
        public T? Value { get; init; }
    }
}