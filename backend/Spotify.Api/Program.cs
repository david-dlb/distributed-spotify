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
    .WriteTo
    .Console(
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

try {
    var url = app.Configuration["ASPNETCORE_URLS"];
    Log.Information($"The application is running at: {url}");
    var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
    using (var scope = serviceScopeFactory.CreateScope())
    {
        var chordManager = scope.ServiceProvider.GetRequiredService<IChordManagerService>();
        await chordManager.JoinNetworkAsync(app.Configuration["KNOWN_NODE_URL"] ?? "http://localhost:6001");
    }

    var _stabilizationTimer = new Timer(async (_) =>
    {
        try
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var chordManager = scope.ServiceProvider.GetRequiredService<IChordManagerService>();
                await chordManager.StabilizeAsync();
                await chordManager.FixFingerTableAsync();
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error en la tarea de estabilización.");
        }
    }, null, TimeSpan.Zero, TimeSpan.FromSeconds(10));

    app.Run();
}catch(Exception e){
    Log.Error(e, "There is an error when tried to run the app.");
    Log.Error(e, "Details: {ErrorMessage}.", e.Message);
    Log.Error(e, "StackTrace: {StackTrace}.", e.StackTrace);
    Log.Error(e, "InnerException: {InnerException}.", e.InnerException);
}finally{ 
    Log.Information("Shutting down the application.");
}