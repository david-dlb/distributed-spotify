namespace Spotify.Domain.Common.Interfaces;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}