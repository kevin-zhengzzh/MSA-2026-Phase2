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
        var raw = await _db.Users
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
                u.AvatarUpdatedAt,
                HasAvatar = u.AvatarData != null,
                EquippedTheme = u.EquippedSkinId == null
                    ? "default"
                    : _db.Skins.Where(s => s.Id == u.EquippedSkinId).Select(s => s.Theme).FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (raw is null) return NotFound();

        return Ok(new
        {
            raw.Id,
            raw.Username,
            raw.Email,
            raw.Points,
            raw.Streak,
            raw.LastCheckIn,
            raw.CreatedAt,
            raw.EquippedSkinId,
            raw.EquippedTheme,
            AvatarUrl = raw.HasAvatar ? $"/user/avatar/{raw.Id}?v={raw.AvatarUpdatedAt!.Value.Ticks}" : null
        });
    }

    private static readonly HashSet<string> AllowedAvatarTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif"
    };
    private const long MaxAvatarBytes = 2 * 1024 * 1024; // 2MB

    [HttpPost("avatar")]
    [RequestSizeLimit(MaxAvatarBytes)]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > MaxAvatarBytes)
            return BadRequest(new { message = "Image must be 2MB or smaller." });

        if (!AllowedAvatarTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Unsupported image type. Use JPEG, PNG, WebP, or GIF." });

        var user = await _db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        user.AvatarData = ms.ToArray();
        user.AvatarContentType = file.ContentType;
        user.AvatarUpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { avatarUrl = $"/user/avatar/{user.Id}?v={user.AvatarUpdatedAt.Value.Ticks}" });
    }

    [HttpGet("avatar/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvatar(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user?.AvatarData is null) return NotFound();

        return File(user.AvatarData, user.AvatarContentType ?? "application/octet-stream");
    }
}
