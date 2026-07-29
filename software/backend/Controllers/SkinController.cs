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
public class SkinController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkinController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var user = await _db.Users
            .Include(u => u.OwnedSkins)
            .FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return NotFound();

        var ownedIds = user.OwnedSkins.ToDictionary(s => s.SkinId, s => s.Seen);

        var skins = await _db.Skins
            .Select(s => new SkinDto(
                s.Id,
                s.Name,
                s.Description,
                s.PointCost,
                s.Theme,
                ownedIds.ContainsKey(s.Id),
                user.EquippedSkinId == s.Id,
                s.IsReward,
                ownedIds.ContainsKey(s.Id) && !ownedIds[s.Id]
            ))
            .ToListAsync();

        return Ok(skins);
    }

    // Clears the "new" red-dot notification on every owned skin — called
    // when the Store is opened
    [HttpPut("mark-seen")]
    public async Task<IActionResult> MarkSeen()
    {
        var unseen = await _db.UserSkins
            .Where(us => us.UserId == UserId && !us.Seen)
            .ToListAsync();

        foreach (var us in unseen) us.Seen = true;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/purchase")]
    public async Task<IActionResult> Purchase(int id)
    {
        var user = await _db.Users
            .Include(u => u.OwnedSkins)
            .FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return NotFound();

        if (user.OwnedSkins.Any(s => s.SkinId == id))
            return Conflict(new { message = "Skin already owned." });

        var skin = await _db.Skins.FindAsync(id);
        if (skin is null) return NotFound(new { message = "Skin not found." });

        if (skin.IsReward)
            return BadRequest(new { message = $"{skin.Name} can only be earned, not purchased." });

        if (user.Points < skin.PointCost)
            return BadRequest(new { message = $"Not enough points. Need {skin.PointCost}, have {user.Points}." });

        user.Points -= skin.PointCost;
        _db.UserSkins.Add(new UserSkin
        {
            UserId = UserId,
            SkinId = id,
            UnlockedAt = DateTime.UtcNow
        });

        _db.PointTransactions.Add(new PointTransaction
        {
            UserId = UserId,
            Amount = -skin.PointCost,
            Reason = $"Purchased {skin.Name}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = $"{skin.Name} unlocked!", remainingPoints = user.Points });
    }

    [HttpPut("{id}/equip")]
    public async Task<IActionResult> Equip(int id)
    {
        var user = await _db.Users
            .Include(u => u.OwnedSkins)
            .FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return NotFound();

        if (!user.OwnedSkins.Any(s => s.SkinId == id))
            return Forbid();

        user.EquippedSkinId = id;
        await _db.SaveChangesAsync();

        var skin = await _db.Skins.FindAsync(id);
        return Ok(new { theme = skin!.Theme });
    }

    [HttpDelete("equip")]
    public async Task<IActionResult> Unequip()
    {
        var user = await _db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        user.EquippedSkinId = null;
        await _db.SaveChangesAsync();
        return Ok(new { theme = "default" });
    }
}
