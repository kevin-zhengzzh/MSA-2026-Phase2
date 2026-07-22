namespace backend.Models;

public class WorkoutRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string WorkoutType { get; set; } = string.Empty;
    public int Calories { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
