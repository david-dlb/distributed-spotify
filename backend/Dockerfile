FROM my_dotnet_sdk:latest AS build-and-run

WORKDIR /app


COPY . .

ENV ASPNETCORE_ENVIRONMENT=Development

ENV ASPNETCORE_URLS=http://*:6000

EXPOSE 6002
EXPOSE 6000


ENTRYPOINT ["dotnet", "./Spotify.Api/bin/Debug/net8.0/Spotify.Api.dll"]
