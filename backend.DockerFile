FROM mcr.microsoft.com/dotnet/sdk:8.0.100-1 AS build-and-run

WORKDIR /

RUN apt-get update && apt-get install -y iproute2 sqlite3 python3

COPY ./backend ./app 

RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]

