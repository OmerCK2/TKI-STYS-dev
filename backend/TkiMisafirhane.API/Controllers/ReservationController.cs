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
    public class ReservationController : ControllerBase
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IHubContext<RoomHub> _hubContext;

        public ReservationController(
            IReservationRepository reservationRepository,
            IGuestRepository guestRepository,
            IRoomRepository roomRepository,
            IHubContext<RoomHub> hubContext)
        {
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<ReservationDto>>>> GetAll()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var reservationDtos = new List<ReservationDto>();

            foreach (var reservation in reservations)
            {
                var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
                var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

                reservationDtos.Add(new ReservationDto
                {
                    Id = reservation.Id,
                    RoomId = reservation.RoomId,
                    RoomNumber = room?.RoomNumber ?? 0,
                    GuestId = reservation.GuestId,
                    GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "Bilinmiyor",
                    CheckInDate = reservation.CheckInDate,
                    CheckOutDate = reservation.CheckOutDate,
                    IsActive = reservation.IsActive
                });
            }

            return Ok(ApiResponseDto<IEnumerable<ReservationDto>>.SuccessResponse(reservationDtos));
        }

        [HttpGet("active")]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<ReservationDto>>>> GetActive()
        {
            var reservations = await _reservationRepository.GetActiveReservationsAsync();
            var reservationDtos = new List<ReservationDto>();

            foreach (var reservation in reservations)
            {
                var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
                var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

                reservationDtos.Add(new ReservationDto
                {
                    Id = reservation.Id,
                    RoomId = reservation.RoomId,
                    RoomNumber = room?.RoomNumber ?? 0,
                    GuestId = reservation.GuestId,
                    GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "Bilinmiyor",
                    CheckInDate = reservation.CheckInDate,
                    CheckOutDate = reservation.CheckOutDate,
                    IsActive = reservation.IsActive
                });
            }

            return Ok(ApiResponseDto<IEnumerable<ReservationDto>>.SuccessResponse(reservationDtos));
        }

        [HttpPost("check-in")]
        public async Task<ActionResult<ApiResponseDto<ReservationDto>>> CheckIn([FromBody] CheckInDto checkInDto)
        {
            var room = await _roomRepository.GetByIdAsync(checkInDto.RoomId);
            if (room == null)
            {
                return NotFound(ApiResponseDto<ReservationDto>.ErrorResponse("Oda bulunamadı"));
            }

            if (room.Status != RoomStatus.Empty && room.Status != RoomStatus.Reserved)
            {
                return BadRequest(ApiResponseDto<ReservationDto>.ErrorResponse("Oda şu anda müsait değil"));
            }

            var existingActiveReservation = await _reservationRepository.GetActiveByRoomIdAsync(checkInDto.RoomId);
            if (existingActiveReservation != null)
            {
                return BadRequest(ApiResponseDto<ReservationDto>.ErrorResponse("Bu odada zaten aktif bir rezervasyon var"));
            }

            Guest guest;
            var existingGuest = await _guestRepository.GetByNationalIdAsync(checkInDto.NationalId);
            if (existingGuest != null)
            {
                guest = existingGuest;
            }
            else
            {
                if (checkInDto.NationalId.Length != 11 || !checkInDto.NationalId.All(char.IsDigit))
                {
                    return BadRequest(ApiResponseDto<ReservationDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır"));
                }

                guest = new Guest
                {
                    NationalId = checkInDto.NationalId,
                    FirstName = checkInDto.FirstName,
                    LastName = checkInDto.LastName,
                    PhoneNumber = checkInDto.PhoneNumber,
                    Type = checkInDto.GuestType,
                    Company = checkInDto.Company
                };
                guest = await _guestRepository.CreateAsync(guest);
            }

            var reservation = new Reservation
            {
                RoomId = checkInDto.RoomId,
                GuestId = guest.Id,
                CheckInDate = checkInDto.CheckInDate,
                IsActive = true
            };

            var createdReservation = await _reservationRepository.CreateAsync(reservation);

            room.Status = RoomStatus.Occupied;
            await _roomRepository.UpdateAsync(room);

            await _hubContext.Clients.All.SendAsync("RoomStatusUpdated", new { roomId = room.Id, status = RoomStatus.Occupied });

            var roomDto = new ReservationDto
            {
                Id = createdReservation.Id,
                RoomId = createdReservation.RoomId,
                RoomNumber = room.RoomNumber,
                GuestId = guest.Id,
                GuestName = $"{guest.FirstName} {guest.LastName}",
                CheckInDate = createdReservation.CheckInDate,
                IsActive = true
            };

            return CreatedAtAction(nameof(GetAll), ApiResponseDto<ReservationDto>.SuccessResponse(roomDto, "Giriş işlemi başarıyla tamamlandı"));
        }

        [HttpPost("check-out")]
        public async Task<ActionResult<ApiResponseDto<ReservationDto>>> CheckOut([FromBody] CheckOutDto checkOutDto)
        {
            var reservation = await _reservationRepository.GetByIdAsync(checkOutDto.ReservationId);
            if (reservation == null)
            {
                return NotFound(ApiResponseDto<ReservationDto>.ErrorResponse("Rezervasyon bulunamadı"));
            }

            if (!reservation.IsActive)
            {
                return BadRequest(ApiResponseDto<ReservationDto>.ErrorResponse("Bu rezervasyon zaten kapatılmış"));
            }

            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

            reservation.CheckOutDate = checkOutDto.CheckOutDate;
            reservation.IsActive = false;
            await _reservationRepository.UpdateAsync(reservation);

            if (room != null)
            {
                room.Status = RoomStatus.Empty;
                await _roomRepository.UpdateAsync(room);
                await _hubContext.Clients.All.SendAsync("RoomStatusUpdated", new { roomId = room.Id, status = RoomStatus.Empty });
            }

            var reservationDto = new ReservationDto
            {
                Id = reservation.Id,
                RoomId = reservation.RoomId,
                RoomNumber = room?.RoomNumber ?? 0,
                GuestId = reservation.GuestId,
                GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "Bilinmiyor",
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = reservation.CheckOutDate,
                IsActive = false
            };

            return Ok(ApiResponseDto<ReservationDto>.SuccessResponse(reservationDto, "Çıkış işlemi başarıyla tamamlandı"));
        }
    }
}
