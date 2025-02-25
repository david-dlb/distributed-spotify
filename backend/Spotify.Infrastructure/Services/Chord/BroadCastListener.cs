using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Spotify.Infrastructure.Services.Chord;

public class UdpBroadcastListener : BackgroundService
{
    private readonly ILogger<UdpBroadcastListener> _logger;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly UdpClient _udpClient;
    private readonly int _port = 6001;

    public UdpBroadcastListener(ILogger<UdpBroadcastListener> logger, IServiceScopeFactory serviceScopeFactory)
    {
        _logger = logger;
        _serviceScopeFactory = serviceScopeFactory;
        _udpClient = new UdpClient(_port);
        _udpClient.EnableBroadcast = true;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Escuchando mensajes UDP en el puerto {Port}...", _port);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = await _udpClient.ReceiveAsync();
                string receivedMessage = Encoding.UTF8.GetString(result.Buffer);
                _logger.LogInformation("Mensaje UDP recibido desde {Sender}: {Message}", result.RemoteEndPoint, receivedMessage);
                
                using var scope = _serviceScopeFactory.CreateScope(); 
                await scope.ServiceProvider.GetRequiredService<IChordManagerService>().HandleAliveFrom(result.RemoteEndPoint.Address.ToString());

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al recibir mensaje UDP.");
            }
        }
    }

    public override void Dispose()
    {
        _udpClient.Dispose();
        base.Dispose();
    }
}
