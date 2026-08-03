using backend.Controllers;

namespace backend.Tests.Controllers;

public class CheckInControllerTests
{
    // ResolveToday trusts the client's local date but clamps it to ±1 day of
    // server UTC, so a client can't spoof an arbitrary date to double-claim
    // check-ins. These tests pin that contract down.

    [Fact]
    public void NullLocalDate_FallsBackToUtcToday()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = CheckInController.ResolveToday(null);
        Assert.Equal(utcToday, result);
    }

    [Fact]
    public void UnparsableLocalDate_FallsBackToUtcToday()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = CheckInController.ResolveToday("not-a-date");
        Assert.Equal(utcToday, result);
    }

    [Fact]
    public void LocalDate_OneDayAhead_IsAccepted()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var tomorrow = utcToday.AddDays(1);
        var result = CheckInController.ResolveToday(tomorrow.ToString("yyyy-MM-dd"));
        Assert.Equal(tomorrow, result);
    }

    [Fact]
    public void LocalDate_OneDayBehind_IsAccepted()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = utcToday.AddDays(-1);
        var result = CheckInController.ResolveToday(yesterday.ToString("yyyy-MM-dd"));
        Assert.Equal(yesterday, result);
    }

    [Fact]
    public void LocalDate_TwoDaysAhead_IsClampedToUtcToday()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var spoofed = utcToday.AddDays(2);
        var result = CheckInController.ResolveToday(spoofed.ToString("yyyy-MM-dd"));
        Assert.Equal(utcToday, result);
    }

    [Fact]
    public void LocalDate_TwoDaysBehind_IsClampedToUtcToday()
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        var spoofed = utcToday.AddDays(-2);
        var result = CheckInController.ResolveToday(spoofed.ToString("yyyy-MM-dd"));
        Assert.Equal(utcToday, result);
    }
}
