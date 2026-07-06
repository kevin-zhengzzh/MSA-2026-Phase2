using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _db.Users
            .Include(u => u.OwnedSkins)
            .Where(u => u.Id == UserId)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Points,
                u.Streak,
                u.LastCheckIn,
                u.CreatedAt,
                u.EquippedSkinId,
                EquippedTheme = u.EquippedSkinId == null
                    ? "default"
                    : _db.Skins.Where(s => s.Id == u.EquippedSkinId).Select(s => s.Theme).FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        return user is null ? NotFound() : Ok(user);
    }
}
