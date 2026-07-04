using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly Services.IJwtService _jwtService;

        public AuthController(IUserRepository userRepository, Services.IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponseDto<AuthDto>>> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return BadRequest(ApiResponseDto<AuthDto>.ErrorResponse("Geçersiz kullanıcı adı veya şifre"));
            }

            var token = _jwtService.GenerateToken(user);
            var response = new AuthDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(8),
                Username = user.Username,
                Email = user.Email
            };

            return Ok(ApiResponseDto<AuthDto>.SuccessResponse(response));
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponseDto<UserDto>>> Register([FromBody] RegisterDto registerDto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(registerDto.Username);
            if (existingUser != null)
            {
                return BadRequest(ApiResponseDto<UserDto>.ErrorResponse("Bu kullanıcı adı zaten kullanılıyor"));
            }

            var existingEmail = await _userRepository.GetByEmailAsync(registerDto.Email);
            if (existingEmail != null)
            {
                return BadRequest(ApiResponseDto<UserDto>.ErrorResponse("Bu e-posta adresi zaten kullanılıyor"));
            }

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var userDto = new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Email = createdUser.Email,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName
            };

            return Ok(ApiResponseDto<UserDto>.SuccessResponse(userDto, "Kayıt başarılı"));
        }

        [Authorize]
        [HttpGet("me")]
        public ActionResult<ApiResponseDto<UserDto>> GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var userDto = new UserDto
            {
                Id = userId,
                Username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "",
                Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "",
                FirstName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value ?? "",
                LastName = User.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value ?? ""
            };

            return Ok(ApiResponseDto<UserDto>.SuccessResponse(userDto));
        }
    }
}
