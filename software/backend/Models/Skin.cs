namespace backend.Models;

public class Skin
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointCost { get; set; }

    // Maps to a CSS theme name applied as data-theme on the root element
    public string Theme { get; set; } = string.Empty;
}
