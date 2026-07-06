namespace backend.DTOs;

public record AuthResponse(string Token, int UserId, string Username);
