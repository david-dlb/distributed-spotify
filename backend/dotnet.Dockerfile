# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0.100-1 AS base-build

WORKDIR /app

LABEL stage=build

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base-run

WORKDIR /app

LABEL stage=run

ENTRYPOINT ["dotnet"]
