using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GuestController : ControllerBase
    {
        private readonly IGuestRepository _guestRepository;

        public GuestController(IGuestRepository guestRepository)
        {
            _guestRepository = guestRepository;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<GuestDto>>>> GetAll()
        {
            var guests = await _guestRepository.GetAllAsync();
            var guestDtos = guests.Select(MapToDto);
            return Ok(ApiResponseDto<IEnumerable<GuestDto>>.SuccessResponse(guestDtos));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponseDto<GuestDto>>> GetById(string id)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
            {
                return NotFound(ApiResponseDto<GuestDto>.ErrorResponse("Misafir bulunamadı"));
            }
            return Ok(ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(guest)));
        }

        [HttpGet("national-id/{nationalId}")]
        public async Task<ActionResult<ApiResponseDto<GuestDto>>> GetByNationalId(string nationalId)
        {
            if (nationalId.Length != 11 || !nationalId.All(char.IsDigit))
            {
                return BadRequest(ApiResponseDto<GuestDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır"));
            }

            var guest = await _guestRepository.GetByNationalIdAsync(nationalId);
            if (guest == null)
            {
                return NotFound(ApiResponseDto<GuestDto>.ErrorResponse("Bu TC Kimlik numarasına kayıtlı misafir bulunamadı"));
            }
            return Ok(ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(guest)));
        }

        [HttpGet("type/{type}")]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<GuestDto>>>> GetByType(GuestType type)
        {
            var guests = await _guestRepository.GetByTypeAsync(type);
            var guestDtos = guests.Select(MapToDto);
            return Ok(ApiResponseDto<IEnumerable<GuestDto>>.SuccessResponse(guestDtos));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponseDto<GuestDto>>> Create([FromBody] CreateGuestDto createGuestDto)
        {
            if (createGuestDto.NationalId.Length != 11 || !createGuestDto.NationalId.All(char.IsDigit))
            {
                return BadRequest(ApiResponseDto<GuestDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır"));
            }

            var existingGuest = await _guestRepository.GetByNationalIdAsync(createGuestDto.NationalId);
            if (existingGuest != null)
            {
                return BadRequest(ApiResponseDto<GuestDto>.ErrorResponse("Bu TC Kimlik numarası zaten kayıtlı"));
            }

            var guest = new Guest
            {
                NationalId = createGuestDto.NationalId,
                FirstName = createGuestDto.FirstName,
                LastName = createGuestDto.LastName,
                PhoneNumber = createGuestDto.PhoneNumber,
                Type = createGuestDto.Type,
                Company = createGuestDto.Company
            };

            var createdGuest = await _guestRepository.CreateAsync(guest);
            return CreatedAtAction(nameof(GetById), new { id = createdGuest.Id },
                ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(createdGuest), "Misafir başarıyla oluşturuldu"));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponseDto<GuestDto>>> Update(string id, [FromBody] CreateGuestDto updateGuestDto)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
            {
                return NotFound(ApiResponseDto<GuestDto>.ErrorResponse("Misafir bulunamadı"));
            }

            guest.FirstName = updateGuestDto.FirstName;
            guest.LastName = updateGuestDto.LastName;
            guest.PhoneNumber = updateGuestDto.PhoneNumber;
            guest.Type = updateGuestDto.Type;
            guest.Company = updateGuestDto.Company;

            var updatedGuest = await _guestRepository.UpdateAsync(guest);
            return Ok(ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(updatedGuest), "Misafir başarıyla güncellendi"));
        }

        private static GuestDto MapToDto(Guest guest)
        {
            return new GuestDto
            {
                Id = guest.Id,
                NationalId = guest.NationalId,
                FirstName = guest.FirstName,
                LastName = guest.LastName,
                PhoneNumber = guest.PhoneNumber,
                Type = guest.Type,
                Company = guest.Company
            };
        }
    }
}
