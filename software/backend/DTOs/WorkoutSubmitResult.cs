namespace backend.DTOs;

public record WorkoutSubmitResult(
    int Id,
    string WorkoutType,
    int Calories,
    DateTime CreatedAt,
    int PointsEarned,
    int TotalPoints
);
