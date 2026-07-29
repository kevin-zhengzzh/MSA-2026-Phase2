using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDarkSkinRewardAndSeenFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Seen",
                table: "UserSkins",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsReward",
                table: "Skins",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Skins",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsReward",
                value: false);

            migrationBuilder.UpdateData(
                table: "Skins",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsReward",
                value: false);

            migrationBuilder.UpdateData(
                table: "Skins",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsReward",
                value: false);

            migrationBuilder.UpdateData(
                table: "Skins",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsReward",
                value: false);

            migrationBuilder.InsertData(
                table: "Skins",
                columns: new[] { "Id", "Description", "IsReward", "Name", "PointCost", "Theme" },
                values: new object[] { 5, "Easy on the eyes at night. Earned at a 7-day streak.", true, "Dark", 0, "dark" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Skins",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DropColumn(
                name: "Seen",
                table: "UserSkins");

            migrationBuilder.DropColumn(
                name: "IsReward",
                table: "Skins");
        }
    }
}
