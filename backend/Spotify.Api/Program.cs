using Spotify.Application;
using Spotify.Infrastructure;
using Serilog;
using Serilog.Sinks.SystemConsole.Themes;
using Spotify.Infrastructure.Services.Chord;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Warning);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(
        theme: AnsiConsoleTheme.Sixteen,
        outputTemplate: "[{Level}] {Timestamp:HH:mm:ss} {Message}{NewLine}")
    .CreateLogger();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration);

var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:6002";
Log.Information(urls);
builder.WebHost.UseUrls(urls);

Log.Information("Building application.");
var app = builder.Build();

app.UseCors("AllowAllOrigins");
if (app.Environment.IsDevelopment())
{
    Log.Information("Environment set as development.");
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Documentation v1");
        c.RoutePrefix = string.Empty;
    });
}

app.MapControllers();

// Definir un `CancellationTokenSource` para detener los timers al apagar la app.
var cts = new CancellationTokenSource();
var token = cts.Token;

// Variables estáticas para evitar que los timers sean recolectados por el GC.
Timer? _broadCastTimer = null;
Timer? _forwardDataTimer = null;
Timer? _healthCheckTimer = null;

try
{
    var url = app.Configuration["ASPNETCORE_URLS"];
    Log.Information($"The application is running at: {url}");
    var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();

    async Task RunSafeAsync(Func<IChordManagerService, Task> action)
    {
        if (token.IsCancellationRequested) return;

        try
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var chordManager = scope.ServiceProvider.GetRequiredService<IChordManagerService>();
                await action(chordManager);
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error ejecutando una tarea en background.");
        }
    }

    _broadCastTimer = new Timer(async _ => await RunSafeAsync(chord => chord.BroadCastIAmAliveAsync()), 
        null, TimeSpan.Zero, TimeSpan.FromSeconds(10));

    _forwardDataTimer = new Timer(async _ => await RunSafeAsync(chord => chord.ForwardDataCatalog()), 
        null, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(4));

    _healthCheckTimer = new Timer(async _ => await RunSafeAsync(chord => chord.HealthCheck()), 
        null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(2));

    app.Lifetime.ApplicationStopping.Register(() =>
    {
        Log.Information("Shutting down timers...");
        cts.Cancel();
        _broadCastTimer?.Dispose();
        _forwardDataTimer?.Dispose();
        _healthCheckTimer?.Dispose();
    });

    app.Run();
}
catch (Exception e)
{
    Log.Error(e, "There was an error when trying to run the app.");
    Log.Error("Details: {ErrorMessage}.", e.Message);
    Log.Error("StackTrace: {StackTrace}.", e.StackTrace);
    Log.Error("InnerException: {InnerException}.", e.InnerException);
}
finally
{
    Log.Information("Shutting down the application.");
}
