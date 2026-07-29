namespace backend.Models;

public class UserSkin
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int SkinId { get; set; }
    public Skin Skin { get; set; } = null!;
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    // Cleared to true once the user has opened the Store since unlocking —
    // drives the "you got a new skin" red-dot notification
    public bool Seen { get; set; } = false;
}
