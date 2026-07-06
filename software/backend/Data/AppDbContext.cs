using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<CheckIn> CheckIns { get; set; }
    public DbSet<Skin> Skins { get; set; }
    public DbSet<UserSkin> UserSkins { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        // One check-in per user per day
        modelBuilder.Entity<CheckIn>()
            .HasIndex(c => new { c.UserId, c.Date }).IsUnique();

        // UserSkin uses composite primary key
        modelBuilder.Entity<UserSkin>()
            .HasKey(us => new { us.UserId, us.SkinId });

        // Seed purchasable skins (null EquippedSkinId = default green theme)
        modelBuilder.Entity<Skin>().HasData(
            new Skin { Id = 1, Name = "Ocean",    Description = "Cool blue tones.",          PointCost = 100, Theme = "ocean"    },
            new Skin { Id = 2, Name = "Sunset",   Description = "Warm orange energy.",       PointCost = 200, Theme = "sunset"   },
            new Skin { Id = 3, Name = "Midnight", Description = "Deep purple mystery.",      PointCost = 300, Theme = "midnight" },
            new Skin { Id = 4, Name = "Cherry",   Description = "Bold pink for champions.",  PointCost = 500, Theme = "cherry"   }
        );
    }
}
