namespace backend.DTOs;

public record PointTransactionDto(
    int Id,
    int Amount,
    string Reason,
    DateTime CreatedAt
);
