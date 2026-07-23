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
}
