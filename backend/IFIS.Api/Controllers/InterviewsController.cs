using IFIS.Api.Data;
using IFIS.Api.Dtos;
using IFIS.Api.Models;
using IFIS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IFIS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class InterviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public InterviewsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InterviewDto>>> GetAll()
    {
        var userId = User.GetUserId();
        var interviews = await _db.Interviews
            .Include(i => i.Rounds)
            .Include(i => i.Weaknesses)
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.InterviewDate)
            .ToListAsync();

        return Ok(interviews.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InterviewDto>> GetById(int id)
    {
        var interview = await LoadOwned(id);
        return interview is null ? NotFound() : Ok(ToDto(interview));
    }

    [HttpPost]
    public async Task<ActionResult<InterviewDto>> Create(InterviewUpsertRequest req)
    {
        var interview = new Interview { UserId = User.GetUserId() };
        Apply(interview, req);

        _db.Interviews.Add(interview);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = interview.Id }, ToDto(interview));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<InterviewDto>> Update(int id, InterviewUpsertRequest req)
    {
        var interview = await LoadOwned(id);
        if (interview is null) return NotFound();

        // Replace child collections for a clean upsert.
        _db.InterviewRounds.RemoveRange(interview.Rounds);
        _db.WeaknessTags.RemoveRange(interview.Weaknesses);
        interview.Rounds.Clear();
        interview.Weaknesses.Clear();

        Apply(interview, req);
        await _db.SaveChangesAsync();

        return Ok(ToDto(interview));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var interview = await LoadOwned(id);
        if (interview is null) return NotFound();

        _db.Interviews.Remove(interview);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Interview?> LoadOwned(int id)
    {
        var userId = User.GetUserId();
        return await _db.Interviews
            .Include(i => i.Rounds)
            .Include(i => i.Weaknesses)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    }

    private static void Apply(Interview interview, InterviewUpsertRequest req)
    {
        interview.CompanyName = req.CompanyName.Trim();
        interview.JobRole = req.JobRole.Trim();
        interview.InterviewDate = req.InterviewDate;
        interview.Mode = req.Mode;
        interview.NumberOfRounds = req.NumberOfRounds;
        interview.Outcome = req.Outcome;
        interview.CandidateFeedback = req.CandidateFeedback;
        interview.PreConfidence = req.PreConfidence;
        interview.DuringConfidence = req.DuringConfidence;
        interview.PostConfidence = req.PostConfidence;

        if (req.Rounds is not null)
        {
            foreach (var r in req.Rounds)
                interview.Rounds.Add(new InterviewRound
                {
                    RoundNumber = r.RoundNumber,
                    RoundType = r.RoundType,
                    Cleared = r.Cleared,
                    Notes = r.Notes
                });
        }

        if (req.Weaknesses is not null)
        {
            foreach (var w in req.Weaknesses)
                interview.Weaknesses.Add(new WeaknessTag
                {
                    Category = w.Category,
                    SeverityPercent = w.SeverityPercent,
                    Topic = w.Topic
                });
        }
    }

    private static InterviewDto ToDto(Interview i) => new(
        i.Id,
        i.CompanyName,
        i.JobRole,
        i.InterviewDate,
        i.Mode,
        i.NumberOfRounds,
        i.Outcome,
        i.CandidateFeedback,
        i.PreConfidence,
        i.DuringConfidence,
        i.PostConfidence,
        i.CreatedAt,
        i.Rounds.OrderBy(r => r.RoundNumber)
            .Select(r => new RoundDto(r.RoundNumber, r.RoundType, r.Cleared, r.Notes)).ToList(),
        i.Weaknesses.Select(w => new WeaknessDto(w.Category, w.SeverityPercent, w.Topic)).ToList());
}
