using System.ComponentModel.DataAnnotations;
using IFIS.Api.Models;

namespace IFIS.Api.Dtos;

public record RegisterRequest(
    [Required, MaxLength(120)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    UserRole Role = UserRole.Candidate,
    string? TargetRole = null);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(6)] string NewPassword);

public record UserDto(
    int Id,
    string FullName,
    string Email,
    UserRole Role,
    string? TargetRole);

public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserDto User);
