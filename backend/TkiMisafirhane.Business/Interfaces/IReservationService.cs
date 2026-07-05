using TkiMisafirhane.Core.DTOs;

namespace TkiMisafirhane.Business.Interfaces
{
    public interface IReservationService
    {
        Task<ApiResponseDto<IEnumerable<ReservationDto>>> GetAllReservationsAsync();
        Task<ApiResponseDto<IEnumerable<ReservationDto>>> GetActiveReservationsAsync();
        Task<ApiResponseDto<ReservationDto>> CheckInAsync(CheckInDto dto);
        Task<ApiResponseDto<ReservationDto>> CheckOutAsync(CheckOutDto dto);
    }
}
