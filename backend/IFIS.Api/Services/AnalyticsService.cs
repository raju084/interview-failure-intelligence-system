using IFIS.Api.Dtos;
using IFIS.Api.Models;

namespace IFIS.Api.Services;

public interface IAnalyticsService
{
    DashboardSummary BuildSummary(IReadOnlyList<Interview> interviews);
}

/// <summary>
/// Pure, in-memory analytics. Given a candidate's interviews it derives the
/// Failure DNA Profile, confidence trend, outcome breakdown, Career Risk Score
/// and a set of personalised recommendations.
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    public DashboardSummary BuildSummary(IReadOnlyList<Interview> interviews)
    {
        var outcomes = BuildOutcomes(interviews);
        var failureDna = BuildFailureDna(interviews);
        var confidence = BuildConfidenceTrend(interviews);
        var risk = BuildCareerRisk(interviews, outcomes, failureDna);
        var recommendations = BuildRecommendations(failureDna, risk, outcomes);

        return new DashboardSummary(
            TotalInterviews: interviews.Count,
            Outcomes: outcomes,
            CareerRisk: risk,
            FailureDna: failureDna,
            ConfidenceTrend: confidence,
            TopRecommendations: recommendations);
    }

    private static OutcomeBreakdown BuildOutcomes(IReadOnlyList<Interview> interviews)
    {
        int total = interviews.Count;
        int selected = interviews.Count(i => i.Outcome == InterviewOutcome.Selected);
        int rejected = interviews.Count(i => i.Outcome == InterviewOutcome.Rejected);
        int pending = interviews.Count(i => i.Outcome == InterviewOutcome.Pending);
        int onHold = interviews.Count(i => i.Outcome == InterviewOutcome.OnHold);
        int withdrawn = interviews.Count(i => i.Outcome == InterviewOutcome.Withdrawn);

        int decided = selected + rejected;
        double successRate = decided == 0 ? 0 : Math.Round((double)selected / decided * 100, 1);

        return new OutcomeBreakdown(total, selected, rejected, pending, onHold, withdrawn, successRate);
    }

    private static List<FailureDnaItem> BuildFailureDna(IReadOnlyList<Interview> interviews)
    {
        var tags = interviews.SelectMany(i => i.Weaknesses).ToList();
        if (tags.Count == 0) return new List<FailureDnaItem>();

        return tags
            .GroupBy(t => t.Category)
            .Select(g => new FailureDnaItem(
                Category: g.Key,
                Label: Humanize(g.Key),
                WeaknessPercent: Math.Round(g.Average(t => t.SeverityPercent), 1),
                Occurrences: g.Count()))
            .OrderByDescending(x => x.WeaknessPercent)
            .ToList();
    }

    private static List<ConfidenceTrendPoint> BuildConfidenceTrend(IReadOnlyList<Interview> interviews)
        => interviews
            .OrderBy(i => i.InterviewDate)
            .Select(i => new ConfidenceTrendPoint(i.InterviewDate, i.CompanyName, i.PreConfidence, i.DuringConfidence, i.PostConfidence))
            .ToList();

    private static CareerRiskResult BuildCareerRisk(
        IReadOnlyList<Interview> interviews,
        OutcomeBreakdown outcomes,
        List<FailureDnaItem> failureDna)
    {
        var drivers = new List<string>();
        double score = 0;

        // 1. Rejection frequency (max 40 pts)
        int decided = outcomes.Selected + outcomes.Rejected;
        double rejectionRate = decided == 0 ? 0 : (double)outcomes.Rejected / decided;
        double rejectionPts = rejectionRate * 40;
        score += rejectionPts;
        if (rejectionRate >= 0.6)
            drivers.Add($"High rejection rate ({rejectionRate * 100:0}% of decided interviews).");

        // 2. Severity of dominant weaknesses (max 35 pts)
        double avgSeverity = failureDna.Count == 0 ? 0 : failureDna.Average(f => f.WeaknessPercent);
        double severityPts = avgSeverity / 100 * 35;
        score += severityPts;
        if (avgSeverity >= 60 && failureDna.Count > 0)
            drivers.Add($"Recurring weakness in {failureDna[0].Label} (avg {failureDna[0].WeaknessPercent:0}%).");

        // 3. Confidence drop pattern (max 15 pts)
        var drops = interviews.Where(i => i.PreConfidence > i.PostConfidence).ToList();
        double dropRatio = interviews.Count == 0 ? 0 : (double)drops.Count / interviews.Count;
        score += dropRatio * 15;
        if (dropRatio >= 0.5 && interviews.Count > 0)
            drivers.Add("Confidence frequently drops during interviews.");

        // 4. Inactivity (max 10 pts) - no interview in last 60 days
        var last = interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault();
        if (last is not null && (DateTime.UtcNow - last.InterviewDate).TotalDays > 60)
        {
            score += 10;
            drivers.Add("No interview activity in the last 60 days.");
        }

        int finalScore = (int)Math.Round(Math.Clamp(score, 0, 100));
        string level = finalScore >= 66 ? "High" : finalScore >= 33 ? "Medium" : "Low";

        if (drivers.Count == 0)
            drivers.Add("No major risk drivers detected. Keep practising consistently.");

        return new CareerRiskResult(level, finalScore, drivers);
    }

    private static List<string> BuildRecommendations(
        List<FailureDnaItem> failureDna,
        CareerRiskResult risk,
        OutcomeBreakdown outcomes)
    {
        var recs = new List<string>();

        foreach (var item in failureDna.Take(3))
        {
            recs.Add(item.Category switch
            {
                WeaknessCategory.Technical => "Strengthen core technical fundamentals with daily problem-solving.",
                WeaknessCategory.Communication => "Practise structured answers (STAR method) and mock interviews.",
                WeaknessCategory.Confidence => "Do timed mock interviews to build composure under pressure.",
                WeaknessCategory.ProjectExplanation => "Prepare a crisp 2-minute narrative for each major project.",
                WeaknessCategory.Behavioral => "Build a bank of behavioral stories mapped to common questions.",
                WeaknessCategory.Aptitude => "Schedule regular aptitude drills to rebuild speed and accuracy.",
                WeaknessCategory.TimeManagement => "Practise solving problems against a clock to improve pacing.",
                _ => "Review feedback notes and target your weakest area first."
            });
        }

        if (risk.Level == "High")
            recs.Add("Your career risk is high - focus on one weakness at a time before applying further.");

        if (outcomes.SuccessRate < 25 && outcomes.Rejected > 0)
            recs.Add("Low success rate detected - consider a structured preparation plan before the next interview.");

        if (recs.Count == 0)
            recs.Add("Log more interviews to unlock personalised recommendations.");

        return recs.Distinct().ToList();
    }

    private static string Humanize(WeaknessCategory c) => c switch
    {
        WeaknessCategory.ProjectExplanation => "Project Explanation",
        WeaknessCategory.TimeManagement => "Time Management",
        _ => c.ToString()
    };
}
