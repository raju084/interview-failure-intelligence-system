using IFIS.Api.Models;

namespace IFIS.Api.Dtos;

public record FailureDnaItem(
    WeaknessCategory Category,
    string Label,
    double WeaknessPercent,
    int Occurrences);

public record ConfidenceTrendPoint(
    DateTime Date,
    string Company,
    int Pre,
    int During,
    int Post);

public record OutcomeBreakdown(
    int Total,
    int Selected,
    int Rejected,
    int Pending,
    int OnHold,
    int Withdrawn,
    double SuccessRate);

public record CareerRiskResult(
    string Level,          // Low / Medium / High
    int Score,             // 0-100
    List<string> Drivers); // human-readable reasons

public record DashboardSummary(
    int TotalInterviews,
    OutcomeBreakdown Outcomes,
    CareerRiskResult CareerRisk,
    List<FailureDnaItem> FailureDna,
    List<ConfidenceTrendPoint> ConfidenceTrend,
    List<string> TopRecommendations);
