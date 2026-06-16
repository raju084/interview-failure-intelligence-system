using System.ComponentModel.DataAnnotations;

namespace IFIS.Api.Models;

public class Interview
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public ApplicationUser? User { get; set; }

    [Required, MaxLength(150)]
    public string CompanyName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string JobRole { get; set; } = string.Empty;

    public DateTime InterviewDate { get; set; }

    public InterviewMode Mode { get; set; } = InterviewMode.Online;

    public int NumberOfRounds { get; set; } = 1;

    public InterviewOutcome Outcome { get; set; } = InterviewOutcome.Pending;

    [MaxLength(2000)]
    public string? CandidateFeedback { get; set; }

    // Confidence Drop Detector: 1-10 scale captured at three stages.
    public int PreConfidence { get; set; }
    public int DuringConfidence { get; set; }
    public int PostConfidence { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<InterviewRound> Rounds { get; set; } = new List<InterviewRound>();
    public ICollection<WeaknessTag> Weaknesses { get; set; } = new List<WeaknessTag>();
}
