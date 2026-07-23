using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RewardsController(AppDbContext db) => _db = db;

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
            .Where(c => c.UserId == UserId && c.Date == today)
            .Select(c => new { c.PointsEarned, c.Claimed })
            .FirstOrDefaultAsync();

        var workout = await _db.WorkoutRecords
            .Where(w => w.UserId == UserId && w.Date == today && w.PointsEarned > 0)
            .Select(w => new { w.PointsEarned, w.Claimed })
            .FirstOrDefaultAsync();

        return Ok(new { checkIn, workout });
    }

    [HttpPost("claim")]
    public async Task<IActionResult> Claim([FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);
        var user = await _db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        var claimedTotal = 0;

        var checkIn = await _db.CheckIns.FirstOrDefaultAsync(
            c => c.UserId == UserId && c.Date == today && !c.Claimed && c.PointsEarned > 0);
        if (checkIn is not null)
        {
            checkIn.Claimed = true;
            user.Points += checkIn.PointsEarned;
            claimedTotal += checkIn.PointsEarned;
            _db.PointTransactions.Add(new PointTransaction
            {
                UserId = UserId,
                Amount = checkIn.PointsEarned,
                Reason = "Daily check-in",
                CreatedAt = DateTime.UtcNow
            });
        }

        var workout = await _db.WorkoutRecords.FirstOrDefaultAsync(
            w => w.UserId == UserId && w.Date == today && !w.Claimed && w.PointsEarned > 0);
        if (workout is not null)
        {
            workout.Claimed = true;
            user.Points += workout.PointsEarned;
            claimedTotal += workout.PointsEarned;
            _db.PointTransactions.Add(new PointTransaction
            {
                UserId = UserId,
                Amount = workout.PointsEarned,
                Reason = $"Workout ({workout.WorkoutType})",
                CreatedAt = DateTime.UtcNow
            });
        }

        if (claimedTotal == 0)
            return Conflict(new { message = "Nothing to claim right now." });

        await _db.SaveChangesAsync();

        return Ok(new { claimedPoints = claimedTotal, totalPoints = user.Points });
    }
}
