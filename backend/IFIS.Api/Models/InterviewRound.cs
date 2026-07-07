using System.ComponentModel.DataAnnotations;

namespace IFIS.Api.Models;

/// <summary>
/// Round-by-round breakdown that powers the Failure Replay Timeline.
/// </summary>
public class InterviewRound
{
    public int Id { get; set; }

    public int InterviewId { get; set; }
    public Interview? Interview { get; set; }

    public int RoundNumber { get; set; }

    [MaxLength(80)]
    public string RoundType { get; set; } = "Technical";

    public bool Cleared { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
