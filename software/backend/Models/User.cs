namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Gamification
    public int Points { get; set; } = 0;
    public int Streak { get; set; } = 0;
    public DateTime? LastCheckIn { get; set; }

    // Which calendar day the workout daily-bonus was last granted for.
    // Tracked here (not derived from WorkoutRecords) so deleting/re-recording
    // a workout on the same day can't re-earn the bonus.
    public DateOnly? LastWorkoutBonusDate { get; set; }

    // User-configurable target for the weekly calorie chart
    public int WeeklyCalorieGoal { get; set; } = 2000;

    // Equipped skin (null = default green theme)
    public int? EquippedSkinId { get; set; }

    // Avatar image, stored inline
    public byte[]? AvatarData { get; set; }
    public string? AvatarContentType { get; set; }
    public DateTime? AvatarUpdatedAt { get; set; }

    // Navigation
    public ICollection<CheckIn> CheckIns { get; set; } = [];
    public ICollection<UserSkin> OwnedSkins { get; set; } = [];
    public ICollection<WorkoutRecord> WorkoutRecords { get; set; } = [];
    public ICollection<PointTransaction> PointTransactions { get; set; } = [];
}
