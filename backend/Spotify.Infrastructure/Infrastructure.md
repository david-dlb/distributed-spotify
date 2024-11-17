
Commando para mandar a construir las migraciones, desde la carpeta ./**backend**
```
dotnet ef migrations add InitialCreate --project Spotify.Infrastructure --startup-project Spotify.Api --output-dir Migrations
```