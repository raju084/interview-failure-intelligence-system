using System.ComponentModel.DataAnnotations;

namespace IFIS.Api.Models;

/// <summary>
/// A weakness observed in a given interview. Aggregated across interviews to
/// build the Failure DNA Profile and Hidden Weakness Correlation Engine.
/// </summary>
public class WeaknessTag
{
    public int Id { get; set; }

    public int InterviewId { get; set; }
    public Interview? Interview { get; set; }

    public WeaknessCategory Category { get; set; }

    /// <summary>Severity of this weakness for the interview, 0-100.</summary>
    [Range(0, 100)]
    public int SeverityPercent { get; set; }

    [MaxLength(120)]
    public string? Topic { get; set; }
}
