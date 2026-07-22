using backend.DTOs;
using FluentValidation;

namespace backend.Validators;

public class WorkoutRecordRequestValidator : AbstractValidator<WorkoutRecordRequest>
{
    public static readonly string[] AllowedTypes =
        ["Running", "Cycling", "Swimming", "Gym", "Yoga", "Other"];

    public WorkoutRecordRequestValidator()
    {
        RuleFor(x => x.WorkoutType)
            .NotEmpty()
            .Must(t => AllowedTypes.Contains(t)).WithMessage("Invalid workout type.");

        RuleFor(x => x.Calories)
            .GreaterThan(0)
            .LessThanOrEqualTo(10000);
    }
}
