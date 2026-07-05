using TkiMisafirhane.Business.Interfaces;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.Business.Services
{
    public class GuestService : IGuestService
    {
        private readonly IGuestRepository _guestRepository;

        public GuestService(IGuestRepository guestRepository)
        {
            _guestRepository = guestRepository;
        }

        public async Task<ApiResponseDto<IEnumerable<GuestDto>>> GetAllGuestsAsync()
        {
            var guests = await _guestRepository.GetAllAsync();
            var guestDtos = guests.Select(MapToDto);
            return ApiResponseDto<IEnumerable<GuestDto>>.SuccessResponse(guestDtos);
        }

        public async Task<ApiResponseDto<GuestDto>> GetGuestByIdAsync(string id)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
                return ApiResponseDto<GuestDto>.ErrorResponse("Misafir bulunamadı");

            return ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(guest));
        }

        public async Task<ApiResponseDto<GuestDto>> GetGuestByNationalIdAsync(string nationalId)
        {
            if (nationalId.Length != 11 || !nationalId.All(char.IsDigit))
                return ApiResponseDto<GuestDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır");

            var guest = await _guestRepository.GetByNationalIdAsync(nationalId);
            if (guest == null)
                return ApiResponseDto<GuestDto>.ErrorResponse("Bu TC Kimlik numarasına kayıtlı misafir bulunamadı");

            return ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(guest));
        }

        public async Task<ApiResponseDto<IEnumerable<GuestDto>>> GetGuestsByTypeAsync(GuestType type)
        {
            var guests = await _guestRepository.GetByTypeAsync(type);
            var guestDtos = guests.Select(MapToDto);
            return ApiResponseDto<IEnumerable<GuestDto>>.SuccessResponse(guestDtos);
        }

        public async Task<ApiResponseDto<GuestDto>> CreateGuestAsync(CreateGuestDto dto)
        {
            if (dto.NationalId.Length != 11 || !dto.NationalId.All(char.IsDigit))
                return ApiResponseDto<GuestDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır");

            var existingGuest = await _guestRepository.GetByNationalIdAsync(dto.NationalId);
            if (existingGuest != null)
                return ApiResponseDto<GuestDto>.ErrorResponse("Bu TC Kimlik numarası zaten kayıtlı");

            var guest = new Guest
            {
                NationalId = dto.NationalId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                Type = dto.Type,
                Company = dto.Company
            };

            var createdGuest = await _guestRepository.CreateAsync(guest);
            return ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(createdGuest), "Misafir başarıyla oluşturuldu");
        }

        public async Task<ApiResponseDto<GuestDto>> UpdateGuestAsync(string id, CreateGuestDto dto)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
                return ApiResponseDto<GuestDto>.ErrorResponse("Misafir bulunamadı");

            guest.FirstName = dto.FirstName;
            guest.LastName = dto.LastName;
            guest.PhoneNumber = dto.PhoneNumber;
            guest.Type = dto.Type;
            guest.Company = dto.Company;

            var updatedGuest = await _guestRepository.UpdateAsync(guest);
            return ApiResponseDto<GuestDto>.SuccessResponse(MapToDto(updatedGuest), "Misafir başarıyla güncellendi");
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
