#!/bin/sh
ip route del default
ip route add default via 10.0.11.254
exec dotnet ./Spotify.Api/bin/Debug/net8.0/Spotify.Api.dll
