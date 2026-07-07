using IFIS.Api.Data;
using IFIS.Api.Dtos;
using IFIS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IFIS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAnalyticsService _analytics;

    public DashboardController(AppDbContext db, IAnalyticsService analytics)
    {
        _db = db;
        _analytics = analytics;
    }

    /// <summary>
    /// Aggregated analytics for the signed-in candidate: Failure DNA, confidence
    /// trend, outcome breakdown, Career Risk Score and recommendations.
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummary>> Summary()
    {
        var userId = User.GetUserId();
        var interviews = await _db.Interviews
            .Include(i => i.Weaknesses)
            .Include(i => i.Rounds)
            .Where(i => i.UserId == userId)
            .ToListAsync();

        return Ok(_analytics.BuildSummary(interviews));
    }
}
