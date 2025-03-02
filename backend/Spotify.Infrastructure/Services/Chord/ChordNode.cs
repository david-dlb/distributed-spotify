namespace Spotify.Infrastructure.Services.Chord
{
    public class ChordNode(string ip, int maxNodeValue)
    {
        public int Id { get; } = int.Parse(ip.Split('.').Last())%maxNodeValue;
        public string Url { get; set; } = "http://" + ip + ":6001" ;
        public string Ip { get; set; } = ip;
    }
}
