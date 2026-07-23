using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValidator<WorkoutRecordRequest> _validator;

    public WorkoutController(AppDbContext db, IValidator<WorkoutRecordRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

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

    private const int DailyWorkoutBonus = 10;

    [HttpGet("today")]
    public async Task<IActionResult> GetToday([FromQuery] string? localDate = null)
    {
        var today = ResolveToday(localDate);
        var recorded = await _db.WorkoutRecords
            .AnyAsync(w => w.UserId == UserId && w.Date == today);
        return Ok(new { recordedToday = recorded });
    }

    [HttpPost]
    public async Task<IActionResult> Create(WorkoutRecordRequest req, [FromQuery] string? localDate = null)
    {
        var validation = await _validator.ValidateAsync(req);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var today = ResolveToday(localDate);

        var user = await _db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        var alreadyEarnedToday = await _db.WorkoutRecords
            .AnyAsync(w => w.UserId == UserId && w.Date == today);

        // Reward is computed now but only credited to the user once claimed
        // via POST /api/rewards/claim.
        var pointsEarned = alreadyEarnedToday ? 0 : DailyWorkoutBonus;

        var record = new WorkoutRecord
        {
            UserId = UserId,
            WorkoutType = req.WorkoutType,
            Calories = req.Calories,
            Date = today,
            CreatedAt = DateTime.UtcNow,
            PointsEarned = pointsEarned,
            Claimed = false
        };
        _db.WorkoutRecords.Add(record);
        await _db.SaveChangesAsync();

        return Ok(new WorkoutSubmitResult(record.Id, record.WorkoutType, record.Calories, record.CreatedAt, pointsEarned, user.Points));
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory()
    {
        var records = await _db.WorkoutRecords
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WorkoutRecordResult(w.Id, w.WorkoutType, w.Calories, w.CreatedAt))
            .ToListAsync();
        return Ok(records);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, WorkoutRecordRequest req)
    {
        var validation = await _validator.ValidateAsync(req);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var record = await _db.WorkoutRecords.FirstOrDefaultAsync(w => w.Id == id && w.UserId == UserId);
        if (record is null) return NotFound();

        record.WorkoutType = req.WorkoutType;
        record.Calories = req.Calories;
        await _db.SaveChangesAsync();

        return Ok(new WorkoutRecordResult(record.Id, record.WorkoutType, record.Calories, record.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _db.WorkoutRecords.FirstOrDefaultAsync(w => w.Id == id && w.UserId == UserId);
        if (record is null) return NotFound();

        _db.WorkoutRecords.Remove(record);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
