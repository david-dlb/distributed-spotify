using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Spotify.Application.Common.Interfaces;
using Spotify.Infrastructure.Repositories;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Infrastructure.Services.Storage;
using Spotify.Application.Common.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Spotify.Infrastructure
{
    public static class InfrastructureDependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<SpotifyDbContext>(options =>
                options.UseSqlite(options => options.MigrationsAssembly("Spotify.Api")));

            // Repositories In Memory
            // services.AddScoped<ISongRepository,InMemorySongRepository>(); 
            // services.AddScoped<IAlbumRepository,InMemoryAlbumRepository>(); 
            // services.AddScoped<IAuthorRepository,InMemoryAuthorRepository>(); 
            
            // Persisted 
            services.AddScoped<ISongRepository,SongRepository>(); 
            services.AddScoped<IAlbumRepository,AlbumRepository>(); 
            services.AddScoped<IAuthorRepository,AuthorRepository>(); 


            // External Services
            services.AddScoped<IStorageService,StorageService>(); 
            return services;
        }
    }
}