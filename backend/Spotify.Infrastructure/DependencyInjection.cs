using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Spotify.Application.Common.Interfaces;
using Spotify.Infrastructure.Repositories;
using Spotify.Application.Common.Interfaces.Services;
using Spotify.Infrastructure.Services.Storage;

namespace Spotify.Infrastructure
{
    public static class InfrastructureDependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Repositories
            services.AddScoped<ISongRepository,InMemorySongRepository>(); 

            // External Services
            services.AddScoped<IStorageService,StorageService>(); 
            return services;
        }
    }
}