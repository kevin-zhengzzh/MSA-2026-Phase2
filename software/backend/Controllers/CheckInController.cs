using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CheckInController : ControllerBase
{
    private readonly AppDbContext _db;

    public CheckInController(AppDbContext db) => _db = db;

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

    [HttpGet("today")]
    public async Task<IActionResult> GetToday([FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);
        var checkIn = await _db.CheckIns
            .FirstOrDefaultAsync(c => c.UserId == UserId && c.Date == today);
        return Ok(new { checkedIn = checkIn is not null });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _db.CheckIns
            .Where(c => c.UserId == UserId)
            .OrderByDescending(c => c.Date)
            .Select(c => new { c.Id, c.Date, c.Note, c.CreatedAt })
            .ToListAsync();
        return Ok(history);
    }

    [HttpPost]
    public async Task<IActionResult> CheckIn([FromBody] string? note = null, [FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);
        var alreadyIn = await _db.CheckIns
            .AnyAsync(c => c.UserId == UserId && c.Date == today);

        if (alreadyIn)
            return Conflict(new { message = "Already checked in today. Come back tomorrow!" });

        var user = await _db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        var checkIn = new CheckIn
        {
            UserId = UserId,
            Date = today,
            Note = note,
            CreatedAt = DateTime.UtcNow
        };
        _db.CheckIns.Add(checkIn);

        // Update streak
        var yesterday = today.AddDays(-1);
        user.Streak = user.LastCheckIn.HasValue &&
                      DateOnly.FromDateTime(user.LastCheckIn.Value) == yesterday
            ? user.Streak + 1
            : 1;
        user.LastCheckIn = DateTime.UtcNow;

        // Points: 10 base + (streak × 2) bonus, capped at 50 bonus
        var bonus = Math.Min(user.Streak * 2, 50);
        var earned = 10 + bonus;
        user.Points += earned;

        await _db.SaveChangesAsync();

        return Ok(new CheckInResult(checkIn.Id, today, earned, user.Points, user.Streak));
    }
}
