#!/bin/sh
ip route del default
ip route add default via 10.0.11.254
exec python3 app/server.py & dotnet app/Spotify.Api/bin/Debug/net8.0/Spotify.Api.dll --no-launch-profile
