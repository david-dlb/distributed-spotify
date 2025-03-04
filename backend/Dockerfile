FROM mcr.microsoft.com/dotnet/sdk:8.0.100-1 AS build-and-run

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y iproute2 sqlite3 python3

COPY startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh

ENTRYPOINT ["/usr/local/bin/startup.sh"]
