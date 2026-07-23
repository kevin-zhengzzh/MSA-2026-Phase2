namespace backend.Models;

public class CheckIn
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateOnly Date { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Reward is computed at check-in time but only credited to the user
    // once claimed via the Daily Tasks claim button
    public int PointsEarned { get; set; }
    public bool Claimed { get; set; }
}
