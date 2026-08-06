using backend.DTOs;
using backend.Validators;

namespace backend.Tests.Validators;

public class UpdateUsernameRequestValidatorTests
{
    private readonly UpdateUsernameRequestValidator _validator = new();

    [Fact]
    public void Valid_Username_Passes()
    {
        var result = _validator.Validate(new UpdateUsernameRequest("new_username"));
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("has space")]
    [InlineData("")]
    public void Invalid_Username_Fails(string username)
    {
        var result = _validator.Validate(new UpdateUsernameRequest(username));
        Assert.False(result.IsValid);
    }
}
