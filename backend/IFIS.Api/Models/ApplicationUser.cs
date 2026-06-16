using System.ComponentModel.DataAnnotations;

namespace IFIS.Api.Models;

public class ApplicationUser
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Candidate;

    [MaxLength(120)]
    public string? TargetRole { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
