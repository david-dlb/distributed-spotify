using Spotify.Domain.Common.Interfaces;

namespace Spotify.Infrastructure.Services.DateTimeProvider
{
    public class DateTimeProvider : IDateTimeProvider
    {
        private static TimeSpan _offset = TimeSpan.Zero;

        public DateTime UtcNow => DateTime.UtcNow + _offset;

        public void Adjust(DateTime source)
        {
            var newOffset = source - DateTime.UtcNow;

            if (newOffset != _offset)
            {
                _offset = newOffset;
            }
        }
    }
}
