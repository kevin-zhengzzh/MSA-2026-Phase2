using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkoutRecordDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkoutRecords_UserId",
                table: "WorkoutRecords");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "WorkoutRecords",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutRecords_UserId_Date",
                table: "WorkoutRecords",
                columns: new[] { "UserId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkoutRecords_UserId_Date",
                table: "WorkoutRecords");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "WorkoutRecords");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutRecords_UserId",
                table: "WorkoutRecords",
                column: "UserId");
        }
    }
}
