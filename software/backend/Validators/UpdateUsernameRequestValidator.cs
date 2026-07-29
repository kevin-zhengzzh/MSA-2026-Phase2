using backend.DTOs;
using FluentValidation;

namespace backend.Validators;

public class UpdateUsernameRequestValidator : AbstractValidator<UpdateUsernameRequest>
{
    public UpdateUsernameRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(30)
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores.");
    }
}
