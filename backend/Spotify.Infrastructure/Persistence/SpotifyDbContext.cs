using System.Reflection;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Spotify.Application.Albums.Queries.GetAll;
using Spotify.Domain.Entities;
using Spotify.Domain.ValueObjects;

public class SpotifyDbContext : DbContext
{
    public SpotifyDbContext(DbContextOptions<SpotifyDbContext> options) : base(options)
    {
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Song>(entity =>
        {
            entity.Property(e => e.Metadata)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { WriteIndented = false }),
                    v => JsonSerializer.Deserialize<SongMetadata>(v, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                )
                .HasColumnType("jsonb");
        });
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        const string conf = "Data Source=/app/Spotify.Infrastructure/spotify.db;Cache=Shared;"; 
        optionsBuilder.UseSqlite(
            conf,
            opt => opt.MigrationsAssembly("Spotify.Infrastructure")
        )
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

        optionsBuilder.ConfigureWarnings(warnings => warnings
                .Log(RelationalEventId.PendingModelChangesWarning));

        using var connection = new SqliteConnection(conf);
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;";
        command.ExecuteNonQuery();

    }

    public DbSet<Song> Songs { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Author> Authors { get; set; }

    public DbSet<T> GetTable<T>() where T: class
    {
        Type type = typeof(T);

        if (type == typeof(Song) || type == typeof(Song))
        {
            return (DbSet<T>) (object) Songs;
        }
        else if (type == typeof(Album))
        {
            return (DbSet<T>) (object) Albums;
        }
        else if (type == typeof(Author))
        {
            return (DbSet<T>) (object) Authors;
        }

        throw new InvalidOperationException($"No DbSet found for {type.Name}");
    }


}
