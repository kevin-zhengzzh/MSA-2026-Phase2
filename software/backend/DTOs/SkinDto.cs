namespace backend.DTOs;

public record SkinDto(
    int Id,
    string Name,
    string Description,
    int PointCost,
    string Theme,
    bool IsOwned,
    bool IsEquipped
);
