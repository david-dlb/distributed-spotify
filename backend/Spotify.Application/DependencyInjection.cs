using Microsoft.Extensions.DependencyInjection;

public static class ApplicationDependencyInjection 
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        return services; 
    }
}