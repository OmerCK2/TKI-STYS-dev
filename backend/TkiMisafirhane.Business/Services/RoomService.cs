using TkiMisafirhane.Business.Interfaces;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.Business.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;

        public RoomService(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<ApiResponseDto<IEnumerable<RoomDto>>> GetAllRoomsAsync()
        {
            var rooms = await _roomRepository.GetAllAsync();
            var roomDtos = rooms.Select(MapToDto);
            return ApiResponseDto<IEnumerable<RoomDto>>.SuccessResponse(roomDtos);
        }

        public async Task<ApiResponseDto<RoomDto>> GetRoomByIdAsync(string id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                return ApiResponseDto<RoomDto>.ErrorResponse("Oda bulunamadı");

            return ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(room));
        }

        public async Task<ApiResponseDto<IEnumerable<RoomDto>>> GetRoomsByStatusAsync(RoomStatus status)
        {
            var rooms = await _roomRepository.GetByStatusAsync(status);
            var roomDtos = rooms.Select(MapToDto);
            return ApiResponseDto<IEnumerable<RoomDto>>.SuccessResponse(roomDtos);
        }

        public async Task<ApiResponseDto<RoomDto>> CreateRoomAsync(CreateRoomDto dto)
        {
            var existingRoom = await _roomRepository.GetByRoomNumberAsync(dto.RoomNumber);
            if (existingRoom != null)
                return ApiResponseDto<RoomDto>.ErrorResponse("Bu oda numarası zaten mevcut");

            var room = new Room
            {
                RoomNumber = dto.RoomNumber,
                Floor = dto.Floor,
                Capacity = dto.Capacity,
                NightlyRateTki = dto.NightlyRateTki,
                NightlyRateCivilian = dto.NightlyRateCivilian,
                Status = RoomStatus.Empty
            };

            var createdRoom = await _roomRepository.CreateAsync(room);
            return ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(createdRoom), "Oda başarıyla oluşturuldu");
        }

        public async Task<ApiResponseDto<RoomDto>> UpdateRoomAsync(string id, UpdateRoomDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                return ApiResponseDto<RoomDto>.ErrorResponse("Oda bulunamadı");

            room.Capacity = dto.Capacity;
            room.NightlyRateTki = dto.NightlyRateTki;
            room.NightlyRateCivilian = dto.NightlyRateCivilian;
            room.Status = dto.Status;

            var updatedRoom = await _roomRepository.UpdateAsync(room);
            return ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(updatedRoom), "Oda başarıyla güncellendi");
        }

        public async Task<ApiResponseDto<object>> DeleteRoomAsync(string id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                return ApiResponseDto<object>.ErrorResponse("Oda bulunamadı");

            if (room.Status == RoomStatus.Occupied)
                return ApiResponseDto<object>.ErrorResponse("Dolu oda silinemez");

            await _roomRepository.DeleteAsync(id);
            return ApiResponseDto<object>.SuccessResponse(null!, "Oda başarıyla silindi");
        }

        private static RoomDto MapToDto(Room room)
        {
            return new RoomDto
            {
                Id = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                Capacity = room.Capacity,
                NightlyRateTki = room.NightlyRateTki,
                NightlyRateCivilian = room.NightlyRateCivilian,
                Status = room.Status
            };
        }
    }
}
