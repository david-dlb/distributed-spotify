using Spotify.Application;
using Spotify.Infrastructure;
using Serilog;
using Serilog.Sinks.SystemConsole.Themes;

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration); 

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
    app.Run();
}catch(Exception e){
    Log.Error(e, "There is an error when tried to run the app.");
    Log.Error(e, "Details: {ErrorMessage}.", e.Message);
    Log.Error(e, "StackTrace: {StackTrace}.", e.StackTrace);
    Log.Error(e, "InnerException: {InnerException}.", e.InnerException);
}finally{ 
    Log.Information("Shutting down the application.");
}