FROM mcr.microsoft.com/dotnet/sdk:8.0.100-1 AS build-and-run

WORKDIR /

COPY ./backend ./app 

RUN apt-get update && apt-get install -y iproute2

RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]

