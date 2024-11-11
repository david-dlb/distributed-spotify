using Spotify.Application;
using Spotify.Infrastructure;
using Serilog;
using Serilog.Sinks.SystemConsole.Themes;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo
    .Console(
        theme: AnsiConsoleTheme.Sixteen,
        outputTemplate: "[{Level}] {Timestamp:HH:mm:ss} {Message}{NewLine}")
    .CreateLogger();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration); 

Log.Information("Building application.");
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Log.Information("Environment set as development.");
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

try {
    Log.Information("The application is running.");
    app.Run();
}catch(Exception e){
    Log.Error("There is an error when tried to run the app.",e);
}finally{ 
    Log.Information("Shutting down the application.");
}