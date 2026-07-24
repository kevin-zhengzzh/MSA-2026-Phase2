namespace backend.DTOs;

public record CheckInResult(
    int Id,
    DateOnly Date,
    int PointsEarned,
    int TotalPoints,
    int Streak,
    DateTime CreatedAt,
    int PercentSurpassed
);
