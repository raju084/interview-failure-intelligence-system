using System.Security.Claims;

namespace IFIS.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id) || !int.TryParse(id, out var parsed))
            throw new UnauthorizedAccessException("User id claim missing or invalid.");
        return parsed;
    }
}
