using IFIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IFIS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<InterviewRound> InterviewRounds => Set<InterviewRound>();
    public DbSet<WeaknessTag> WeaknessTags => Set<WeaknessTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Role).HasConversion<int>();
        });

        modelBuilder.Entity<Interview>(b =>
        {
            b.Property(i => i.Mode).HasConversion<int>();
            b.Property(i => i.Outcome).HasConversion<int>();

            b.HasOne(i => i.User)
                .WithMany(u => u.Interviews)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InterviewRound>(b =>
        {
            b.HasOne(r => r.Interview)
                .WithMany(i => i.Rounds)
                .HasForeignKey(r => r.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WeaknessTag>(b =>
        {
            b.Property(w => w.Category).HasConversion<int>();

            b.HasOne(w => w.Interview)
                .WithMany(i => i.Weaknesses)
                .HasForeignKey(w => w.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
