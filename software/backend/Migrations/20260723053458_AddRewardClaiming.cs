using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRewardClaiming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Claimed",
                table: "WorkoutRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PointsEarned",
                table: "WorkoutRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Claimed",
                table: "CheckIns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PointsEarned",
                table: "CheckIns",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Claimed",
                table: "WorkoutRecords");

            migrationBuilder.DropColumn(
                name: "PointsEarned",
                table: "WorkoutRecords");

            migrationBuilder.DropColumn(
                name: "Claimed",
                table: "CheckIns");

            migrationBuilder.DropColumn(
                name: "PointsEarned",
                table: "CheckIns");
        }
    }
}
