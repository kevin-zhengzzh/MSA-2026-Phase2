namespace backend.DTOs;

public record WorkoutRecordResult(int Id, string WorkoutType, int Calories, DateOnly Date, DateTime CreatedAt);
