using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Spotify.Application.Common.Interfaces;
using Spotify.Infrastructure.Repositories;

namespace Spotify.Infrastructure
{
    public static class InfrastructureDependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<ISongRepository,InMemorySongRepository>(); 
            return services;
        }
    }
}