using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.API.Hubs;

namespace TkiMisafirhane.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoomController : ControllerBase
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IHubContext<RoomHub> _hubContext;

        public RoomController(IRoomRepository roomRepository, IHubContext<RoomHub> hubContext)
        {
            _roomRepository = roomRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<RoomDto>>>> GetAll()
        {
            var rooms = await _roomRepository.GetAllAsync();
            var roomDtos = rooms.Select(MapToDto);
            return Ok(ApiResponseDto<IEnumerable<RoomDto>>.SuccessResponse(roomDtos));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponseDto<RoomDto>>> GetById(string id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
            {
                return NotFound(ApiResponseDto<RoomDto>.ErrorResponse("Oda bulunamadı"));
            }
            return Ok(ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(room)));
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<RoomDto>>>> GetByStatus(RoomStatus status)
        {
            var rooms = await _roomRepository.GetByStatusAsync(status);
            var roomDtos = rooms.Select(MapToDto);
            return Ok(ApiResponseDto<IEnumerable<RoomDto>>.SuccessResponse(roomDtos));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponseDto<RoomDto>>> Create([FromBody] CreateRoomDto createRoomDto)
        {
            var existingRoom = await _roomRepository.GetByRoomNumberAsync(createRoomDto.RoomNumber);
            if (existingRoom != null)
            {
                return BadRequest(ApiResponseDto<RoomDto>.ErrorResponse("Bu oda numarası zaten mevcut"));
            }

            var room = new Room
            {
                RoomNumber = createRoomDto.RoomNumber,
                Floor = createRoomDto.Floor,
                Capacity = createRoomDto.Capacity,
                NightlyRateTki = createRoomDto.NightlyRateTki,
                NightlyRateCivilian = createRoomDto.NightlyRateCivilian,
                Status = RoomStatus.Empty
            };

            var createdRoom = await _roomRepository.CreateAsync(room);
            await BroadcastRoomUpdate();
            return CreatedAtAction(nameof(GetById), new { id = createdRoom.Id },
                ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(createdRoom), "Oda başarıyla oluşturuldu"));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponseDto<RoomDto>>> Update(string id, [FromBody] UpdateRoomDto updateRoomDto)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
            {
                return NotFound(ApiResponseDto<RoomDto>.ErrorResponse("Oda bulunamadı"));
            }

            room.Capacity = updateRoomDto.Capacity;
            room.NightlyRateTki = updateRoomDto.NightlyRateTki;
            room.NightlyRateCivilian = updateRoomDto.NightlyRateCivilian;
            room.Status = updateRoomDto.Status;

            var updatedRoom = await _roomRepository.UpdateAsync(room);
            await BroadcastRoomUpdate();
            return Ok(ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(updatedRoom), "Oda başarıyla güncellendi"));
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponseDto<RoomDto>>> UpdateStatus(string id, [FromBody] RoomStatusUpdateDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
            {
                return NotFound(ApiResponseDto<RoomDto>.ErrorResponse("Oda bulunamadı"));
            }

            room.Status = dto.Status;
            var updatedRoom = await _roomRepository.UpdateAsync(room);
            await BroadcastRoomUpdate();
            return Ok(ApiResponseDto<RoomDto>.SuccessResponse(MapToDto(updatedRoom), "Oda durumu güncellendi"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponseDto<object>>> Delete(string id)
        {
            var result = await _roomRepository.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponseDto<object>.ErrorResponse("Oda bulunamadı"));
            }
            await BroadcastRoomUpdate();
            return Ok(ApiResponseDto<object>.SuccessResponse(null!, "Oda başarıyla silindi"));
        }

        private async Task BroadcastRoomUpdate()
        {
            var rooms = await _roomRepository.GetAllAsync();
            var roomDtos = rooms.Select(MapToDto).ToList();
            await _hubContext.Clients.All.SendAsync("RoomStatusUpdated", roomDtos);
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
