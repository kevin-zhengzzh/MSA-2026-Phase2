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
            .Include(u => u.OwnedSkins).ThenInclude(us => us.Skin)
            .FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return NotFound();

        // Safety net: the 7-day streak reward is normally granted at
        // check-in time (CheckInController.GrantStreakRewardSkin), but if a
        // user's Streak ever ends up >= 7 without that having run — e.g. the
        // field was set some other way — this catches them up here instead
        // of leaving them permanently stuck looking locked in the Store.
        if (user.Streak >= 7 && !user.OwnedSkins.Any(s => s.Skin.IsReward))
        {
            var rewardSkin = await _db.Skins.FirstOrDefaultAsync(s => s.IsReward);
            if (rewardSkin is not null)
            {
                // Just Add() — EF's relationship fixup adds this to the
                // already-loaded user.OwnedSkins collection automatically,
                // so adding it there too would double it up.
                _db.UserSkins.Add(new UserSkin { UserId = UserId, SkinId = rewardSkin.Id, UnlockedAt = DateTime.UtcNow, Seen = false });
                await _db.SaveChangesAsync();
            }
        }

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
