using backend.DTOs;
using backend.Validators;

namespace backend.Tests.Validators;

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var result = _validator.Validate(new LoginRequest("john@example.com", "anything"));
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Empty_Password_Fails()
    {
        var result = _validator.Validate(new LoginRequest("john@example.com", ""));
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Invalid_Email_Fails()
    {
        var result = _validator.Validate(new LoginRequest("not-an-email", "anything"));
        Assert.False(result.IsValid);
    }
}
