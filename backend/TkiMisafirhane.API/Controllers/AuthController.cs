using System.Security.Claims;
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

            if (!user.IsActive)
            {
                return BadRequest(ApiResponseDto<AuthDto>.ErrorResponse("Hesabınız pasif durumda. Yöneticiyle iletişime geçin."));
            }

            var token = _jwtService.GenerateToken(user);
            var response = new AuthDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(8),
                Username = user.Username,
                Email = user.Email,
                RequiresPasswordChange = user.RequiresPasswordChange
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
                LastName = createdUser.LastName,
                IsAdmin = createdUser.IsAdmin,
                RequiresPasswordChange = createdUser.RequiresPasswordChange
            };

            return Ok(ApiResponseDto<UserDto>.SuccessResponse(userDto, "Kayıt başarılı"));
        }

        [Authorize]
        [HttpPost("create-user")]
        public async Task<ActionResult<ApiResponseDto<UserDto>>> AdminCreateUser([FromBody] AdminCreateUserDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUser = await _userRepository.GetByIdAsync(userId!);
            if (currentUser == null || !currentUser.IsAdmin)
            {
                return Forbid();
            }

            var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
            if (existingUser != null)
            {
                return BadRequest(ApiResponseDto<UserDto>.ErrorResponse("Bu kullanıcı adı zaten kullanılıyor"));
            }

            var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingEmail != null)
            {
                return BadRequest(ApiResponseDto<UserDto>.ErrorResponse("Bu e-posta adresi zaten kullanılıyor"));
            }

            var defaultPassword = "TKI2024!";
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                IsAdmin = dto.IsAdmin,
                RequiresPasswordChange = true
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var userDto = new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Email = createdUser.Email,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                IsAdmin = createdUser.IsAdmin,
                RequiresPasswordChange = createdUser.RequiresPasswordChange
            };

            return Ok(ApiResponseDto<UserDto>.SuccessResponse(userDto,
                $"Kullanıcı başarıyla oluşturuldu. Varsayılan şifre: {defaultPassword}"));
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult<ApiResponseDto<object>>> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmNewPassword)
            {
                return BadRequest(ApiResponseDto<object>.ErrorResponse("Yeni şifreler eşleşmiyor"));
            }

            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(ApiResponseDto<object>.ErrorResponse("Yeni şifre en az 6 karakter olmalıdır"));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetByIdAsync(userId!);
            if (user == null)
            {
                return NotFound(ApiResponseDto<object>.ErrorResponse("Kullanıcı bulunamadı"));
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(ApiResponseDto<object>.ErrorResponse("Mevcut şifre hatalı"));
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.RequiresPasswordChange = false;
            await _userRepository.UpdateAsync(user);

            return Ok(ApiResponseDto<object>.SuccessResponse(null!, "Şifre başarıyla değiştirildi"));
        }

        [Authorize]
        [HttpGet("me")]
        public ActionResult<ApiResponseDto<UserDto>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var userDto = new UserDto
            {
                Id = userId,
                Username = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
                Email = User.FindFirst(ClaimTypes.Email)?.Value ?? "",
                FirstName = User.FindFirst(ClaimTypes.GivenName)?.Value ?? "",
                LastName = User.FindFirst(ClaimTypes.Surname)?.Value ?? ""
            };

            return Ok(ApiResponseDto<UserDto>.SuccessResponse(userDto));
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<UserDto>>>> GetAllUsers()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUser = await _userRepository.GetByIdAsync(userId!);
            if (currentUser == null || !currentUser.IsAdmin)
            {
                return Forbid();
            }

            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                IsAdmin = u.IsAdmin,
                RequiresPasswordChange = u.RequiresPasswordChange
            });

            return Ok(ApiResponseDto<IEnumerable<UserDto>>.SuccessResponse(userDtos));
        }
    }
}
