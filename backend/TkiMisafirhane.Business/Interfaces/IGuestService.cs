using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Business.Interfaces
{
    public interface IGuestService
    {
        Task<ApiResponseDto<IEnumerable<GuestDto>>> GetAllGuestsAsync();
        Task<ApiResponseDto<GuestDto>> GetGuestByIdAsync(string id);
        Task<ApiResponseDto<GuestDto>> GetGuestByNationalIdAsync(string nationalId);
        Task<ApiResponseDto<IEnumerable<GuestDto>>> GetGuestsByTypeAsync(GuestType type);
        Task<ApiResponseDto<GuestDto>> CreateGuestAsync(CreateGuestDto dto);
        Task<ApiResponseDto<GuestDto>> UpdateGuestAsync(string id, CreateGuestDto dto);
    }
}
