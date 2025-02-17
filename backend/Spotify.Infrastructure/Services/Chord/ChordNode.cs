using System.ComponentModel;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Spotify.Infrastructure.Services.Chord
{
    public class ChordNode
    {
        public int Id { get; }
        public string Url { get; set; }

        public ChordNode(string url)
        {
            Url = url;
            Id = int.Parse(url.Substring(url.Length-4,4))%16; 
            //  GenerateNodeId(url.Substring(url.Length-5,4));
        }

        private static int GenerateNodeId(string input)
        {
            using var sha1 = SHA1.Create();
            var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
            int hashInt = BitConverter.ToInt32(hashBytes, 0);
            return Math.Abs(hashInt) % 16; 
        }
    }

}