namespace backend.DTOs;

public record WorkoutSubmitResult(
    int Id,
    string WorkoutType,
    int Calories,
    DateOnly Date,
    DateTime CreatedAt,
    int PointsEarned,
    int TotalPoints
);
