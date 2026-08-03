using backend.DTOs;
using backend.Validators;

namespace backend.Tests.Validators;

public class WorkoutRecordRequestValidatorTests
{
    private readonly WorkoutRecordRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var result = _validator.Validate(new WorkoutRecordRequest("Running", 300));
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Unknown_WorkoutType_Fails()
    {
        var result = _validator.Validate(new WorkoutRecordRequest("Skydiving", 300));
        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(10001)]
    public void Out_Of_Range_Calories_Fails(int calories)
    {
        var result = _validator.Validate(new WorkoutRecordRequest("Running", calories));
        Assert.False(result.IsValid);
    }
}
