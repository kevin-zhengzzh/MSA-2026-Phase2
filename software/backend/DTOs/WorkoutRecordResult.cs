namespace backend.DTOs;

public record WorkoutRecordResult(int Id, string WorkoutType, int Calories, DateTime CreatedAt);
