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

    // Equipped skin (null = default green theme)
    public int? EquippedSkinId { get; set; }

    // Navigation
    public ICollection<CheckIn> CheckIns { get; set; } = [];
    public ICollection<UserSkin> OwnedSkins { get; set; } = [];
}
