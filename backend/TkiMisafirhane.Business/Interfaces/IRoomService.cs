using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Business.Interfaces
{
    public interface IRoomService
    {
        Task<ApiResponseDto<IEnumerable<RoomDto>>> GetAllRoomsAsync();
        Task<ApiResponseDto<RoomDto>> GetRoomByIdAsync(string id);
        Task<ApiResponseDto<IEnumerable<RoomDto>>> GetRoomsByStatusAsync(RoomStatus status);
        Task<ApiResponseDto<RoomDto>> CreateRoomAsync(CreateRoomDto dto);
        Task<ApiResponseDto<RoomDto>> UpdateRoomAsync(string id, UpdateRoomDto dto);
        Task<ApiResponseDto<object>> DeleteRoomAsync(string id);
    }
}
