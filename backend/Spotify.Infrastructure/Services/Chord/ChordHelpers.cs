using System.Security.Cryptography;
using System.Text;

namespace Spotify.Infrastructure.Services.Chord
{
    static public class ChordHelper
    {
        public static bool IsIdInInterval(this int id, int start, int end)
        {
            if (start == end)
                return true;
            return start < end ?
                start < id && id <= end :
                start < id || id <= end;
        }
        public static int GenerateIntHash(this string input, int maxValue)
        {
            using var sha1 = SHA1.Create();
            var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
            int hashInt = BitConverter.ToInt32(hashBytes, 0);
            return Math.Abs(hashInt) % maxValue;
        }
    }
}