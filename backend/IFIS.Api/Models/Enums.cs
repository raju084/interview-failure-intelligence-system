namespace IFIS.Api.Models;

public enum UserRole
{
    Candidate = 0,
    Mentor = 1,
    Admin = 2
}

public enum InterviewMode
{
    Online = 0,
    Offline = 1,
    Telephonic = 2,
    Hybrid = 3
}

public enum InterviewOutcome
{
    Pending = 0,
    Selected = 1,
    Rejected = 2,
    OnHold = 3,
    Withdrawn = 4
}

/// <summary>
/// High-level failure categories used by the Failure DNA Profile.
/// </summary>
public enum WeaknessCategory
{
    Technical = 0,
    Communication = 1,
    Confidence = 2,
    ProjectExplanation = 3,
    Behavioral = 4,
    Aptitude = 5,
    TimeManagement = 6
}
