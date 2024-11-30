FROM mcr.microsoft.com/dotnet/sdk:8.0.100-1 AS build-and-run

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y iproute2

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://*:6000


COPY startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh

ENTRYPOINT ["/usr/local/bin/startup.sh"]
