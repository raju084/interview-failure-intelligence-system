using System.ComponentModel.DataAnnotations;
using IFIS.Api.Models;

namespace IFIS.Api.Dtos;

public record RoundDto(
    int RoundNumber,
    string RoundType,
    bool Cleared,
    string? Notes);

public record WeaknessDto(
    WeaknessCategory Category,
    [Range(0, 100)] int SeverityPercent,
    string? Topic);

public record InterviewUpsertRequest(
    [Required, MaxLength(150)] string CompanyName,
    [Required, MaxLength(150)] string JobRole,
    DateTime InterviewDate,
    InterviewMode Mode,
    int NumberOfRounds,
    InterviewOutcome Outcome,
    string? CandidateFeedback,
    [Range(0, 10)] int PreConfidence,
    [Range(0, 10)] int DuringConfidence,
    [Range(0, 10)] int PostConfidence,
    List<RoundDto>? Rounds,
    List<WeaknessDto>? Weaknesses);

public record InterviewDto(
    int Id,
    string CompanyName,
    string JobRole,
    DateTime InterviewDate,
    InterviewMode Mode,
    int NumberOfRounds,
    InterviewOutcome Outcome,
    string? CandidateFeedback,
    int PreConfidence,
    int DuringConfidence,
    int PostConfidence,
    DateTime CreatedAt,
    List<RoundDto> Rounds,
    List<WeaknessDto> Weaknesses);
