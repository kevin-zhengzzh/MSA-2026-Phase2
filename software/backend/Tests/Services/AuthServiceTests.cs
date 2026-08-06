using backend.Data;
using backend.DTOs;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests.Services;

public class AuthServiceTests
{
    private static AppDbContext NewDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration NewConfig()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "test-secret-key-at-least-32-characters-long",
            ["Jwt:Issuer"] = "healthtracker-api",
            ["Jwt:Audience"] = "healthtracker-app",
            ["Jwt:ExpiryHours"] = "24"
        };
        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public async Task Register_CreatesUser_WithHashedPassword()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());

        var response = await service.RegisterAsync(new RegisterRequest("john_doe", "john@example.com", "password123"));

        Assert.NotNull(response);
        var stored = await db.Users.SingleAsync();
        Assert.Equal("john_doe", stored.Username);
        Assert.NotEqual("password123", stored.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", stored.PasswordHash));
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsNull()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());
        await service.RegisterAsync(new RegisterRequest("john_doe", "john@example.com", "password123"));

        var second = await service.RegisterAsync(new RegisterRequest("someone_else", "john@example.com", "password456"));

        Assert.Null(second);
    }

    [Fact]
    public async Task Register_DuplicateUsername_ReturnsNull()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());
        await service.RegisterAsync(new RegisterRequest("john_doe", "john@example.com", "password123"));

        var second = await service.RegisterAsync(new RegisterRequest("john_doe", "other@example.com", "password456"));

        Assert.Null(second);
    }

    [Fact]
    public async Task Login_CorrectPassword_ReturnsToken()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());
        await service.RegisterAsync(new RegisterRequest("john_doe", "john@example.com", "password123"));

        var response = await service.LoginAsync(new LoginRequest("john@example.com", "password123"));

        Assert.NotNull(response);
        Assert.False(string.IsNullOrEmpty(response!.Token));
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsNull()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());
        await service.RegisterAsync(new RegisterRequest("john_doe", "john@example.com", "password123"));

        var response = await service.LoginAsync(new LoginRequest("john@example.com", "wrong-password"));

        Assert.Null(response);
    }

    [Fact]
    public async Task Login_UnknownEmail_ReturnsNull()
    {
        var db = NewDb();
        var service = new AuthService(db, NewConfig());

        var response = await service.LoginAsync(new LoginRequest("nobody@example.com", "password123"));

        Assert.Null(response);
    }
}
