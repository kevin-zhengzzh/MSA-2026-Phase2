using backend.DTOs;
using backend.Validators;

namespace backend.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var result = _validator.Validate(new RegisterRequest("john_doe", "john@example.com", "password123"));
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("ab")]          // too short
    [InlineData("john doe")]    // spaces not allowed
    [InlineData("john!doe")]    // special chars not allowed
    public void Invalid_Username_Fails(string username)
    {
        var result = _validator.Validate(new RegisterRequest(username, "john@example.com", "password123"));
        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("")]
    public void Invalid_Email_Fails(string email)
    {
        var result = _validator.Validate(new RegisterRequest("john_doe", email, "password123"));
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Short_Password_Fails()
    {
        var result = _validator.Validate(new RegisterRequest("john_doe", "john@example.com", "short"));
        Assert.False(result.IsValid);
    }
}
