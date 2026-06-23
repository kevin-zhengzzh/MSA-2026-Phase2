using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoresController : ControllerBase
{
    private readonly AppDbContext _db;

    public ScoresController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var scores = await _db.Scores
            .OrderByDescending(s => s.Score)
            .ToListAsync();
        return Ok(scores);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var entry = await _db.Scores.FindAsync(id);
        if (entry is null) return NotFound();
        return Ok(entry);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ScoreEntry entry)
    {
        _db.Scores.Add(entry);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, entry);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ScoreEntry updated)
    {
        var entry = await _db.Scores.FindAsync(id);
        if (entry is null) return NotFound();

        entry.PlayerName = updated.PlayerName;
        entry.Score = updated.Score;
        await _db.SaveChangesAsync();
        return Ok(entry);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _db.Scores.FindAsync(id);
        if (entry is null) return NotFound();

        _db.Scores.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
