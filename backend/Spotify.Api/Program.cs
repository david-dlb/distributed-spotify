using Spotify.Application;
using Spotify.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLogging(); 
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration); 

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection();

// app.UseAuthorization();

app.MapControllers();

app.Run();