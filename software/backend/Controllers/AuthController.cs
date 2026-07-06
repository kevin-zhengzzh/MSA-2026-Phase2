using backend.DTOs;
using backend.Services;
using backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthController(
        AuthService auth,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _auth = auth;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var validation = await _registerValidator.ValidateAsync(req);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _auth.RegisterAsync(req);
        if (result is null)
            return Conflict(new { message = "Username or email already in use." });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var validation = await _loginValidator.ValidateAsync(req);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _auth.LoginAsync(req);
        if (result is null)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(result);
    }
}
