using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeaderboardController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Trusts the client's local date, clamped to ±1 day of server UTC —
    // real-world timezone offsets never diverge from UTC by more than a day either way.
    private static DateOnly ResolveToday(string? localDate)
    {
        var utcToday = DateOnly.FromDateTime(DateTime.UtcNow);
        if (localDate is not null && DateOnly.TryParse(localDate, out var parsed))
        {
            var diff = parsed.DayNumber - utcToday.DayNumber;
            if (diff is >= -1 and <= 1) return parsed;
        }
        return utcToday;
    }

    [HttpGet]
    public async Task<IActionResult> GetLeaderboard()
    {
        var raw = await _db.Users
            .OrderByDescending(u => u.Points)
            .ThenBy(u => u.Id)
            .Take(50)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Points,
                u.AvatarUpdatedAt,
                HasAvatar = u.AvatarData != null
            })
            .ToListAsync();

        var entries = raw.Select((u, i) => new
        {
            Rank = i + 1,
            u.Id,
            u.Username,
            u.Points,
            IsMe = u.Id == UserId,
            AvatarUrl = u.HasAvatar ? $"/user/avatar/{u.Id}?v={u.AvatarUpdatedAt!.Value.Ticks}" : null
        });

        return Ok(entries);
    }

    // Ranked by current consecutive check-in streak (days), not today's
    // check-in time — that's GetCheckinTodayLeaderboard below
    [HttpGet("streak")]
    public async Task<IActionResult> GetStreakLeaderboard()
    {
        var raw = await _db.Users
            .OrderByDescending(u => u.Streak)
            .ThenBy(u => u.Id)
            .Take(50)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Streak,
                u.AvatarUpdatedAt,
                HasAvatar = u.AvatarData != null
            })
            .ToListAsync();

        var entries = raw.Select((u, i) => new
        {
            Rank = i + 1,
            u.Id,
            u.Username,
            u.Streak,
            IsMe = u.Id == UserId,
            AvatarUrl = u.HasAvatar ? $"/user/avatar/{u.Id}?v={u.AvatarUpdatedAt!.Value.Ticks}" : null
        });

        return Ok(entries);
    }

    // Ranked by calories burned TODAY only, not all-time
    [HttpGet("calories")]
    public async Task<IActionResult> GetCaloriesLeaderboard([FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);

        var raw = await _db.Users
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.AvatarUpdatedAt,
                HasAvatar = u.AvatarData != null,
                Calories = u.WorkoutRecords.Where(w => w.Date == today).Sum(w => (int?)w.Calories) ?? 0
            })
            .OrderByDescending(u => u.Calories)
            .ThenBy(u => u.Id)
            .Take(50)
            .ToListAsync();

        var entries = raw.Select((u, i) => new
        {
            Rank = i + 1,
            u.Id,
            u.Username,
            u.Calories,
            IsMe = u.Id == UserId,
            AvatarUrl = u.HasAvatar ? $"/user/avatar/{u.Id}?v={u.AvatarUpdatedAt!.Value.Ticks}" : null
        });

        return Ok(entries);
    }

    // Ranked by who checked in earliest TODAY — only users who have
    // actually checked in today appear
    [HttpGet("checkin-today")]
    public async Task<IActionResult> GetCheckinTodayLeaderboard([FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);

        var raw = await _db.CheckIns
            .Where(c => c.Date == today)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.User.Id,
                c.User.Username,
                c.CreatedAt,
                c.User.AvatarUpdatedAt,
                HasAvatar = c.User.AvatarData != null
            })
            .Take(50)
            .ToListAsync();

        var entries = raw.Select((c, i) => new
        {
            Rank = i + 1,
            c.Id,
            c.Username,
            CheckedInAt = c.CreatedAt,
            IsMe = c.Id == UserId,
            AvatarUrl = c.HasAvatar ? $"/user/avatar/{c.Id}?v={c.AvatarUpdatedAt!.Value.Ticks}" : null
        });

        return Ok(entries);
    }
}
