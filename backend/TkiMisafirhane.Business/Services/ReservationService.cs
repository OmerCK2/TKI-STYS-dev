using TkiMisafirhane.Business.Interfaces;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.Business.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IRoomRepository _roomRepository;

        public ReservationService(
            IReservationRepository reservationRepository,
            IGuestRepository guestRepository,
            IRoomRepository roomRepository)
        {
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
        }

        public async Task<ApiResponseDto<IEnumerable<ReservationDto>>> GetAllReservationsAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var dtos = new List<ReservationDto>();

            foreach (var reservation in reservations)
            {
                dtos.Add(await MapToDto(reservation));
            }

            return ApiResponseDto<IEnumerable<ReservationDto>>.SuccessResponse(dtos);
        }

        public async Task<ApiResponseDto<IEnumerable<ReservationDto>>> GetActiveReservationsAsync()
        {
            var reservations = await _reservationRepository.GetActiveReservationsAsync();
            var dtos = new List<ReservationDto>();

            foreach (var reservation in reservations)
            {
                dtos.Add(await MapToDto(reservation));
            }

            return ApiResponseDto<IEnumerable<ReservationDto>>.SuccessResponse(dtos);
        }

        public async Task<ApiResponseDto<ReservationDto>> CheckInAsync(CheckInDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(dto.RoomId);
            if (room == null)
                return ApiResponseDto<ReservationDto>.ErrorResponse("Oda bulunamadı");

            if (room.Status != RoomStatus.Empty && room.Status != RoomStatus.Reserved)
                return ApiResponseDto<ReservationDto>.ErrorResponse("Oda şu anda müsait değil");

            var existingActiveReservation = await _reservationRepository.GetActiveByRoomIdAsync(dto.RoomId);
            if (existingActiveReservation != null)
                return ApiResponseDto<ReservationDto>.ErrorResponse("Bu odada zaten aktif bir rezervasyon var");

            Guest guest;
            var existingGuest = await _guestRepository.GetByNationalIdAsync(dto.NationalId);
            if (existingGuest != null)
            {
                guest = existingGuest;
            }
            else
            {
                if (dto.NationalId.Length != 11 || !dto.NationalId.All(char.IsDigit))
                    return ApiResponseDto<ReservationDto>.ErrorResponse("TC Kimlik numarası 11 haneli ve rakamlardan oluşmalıdır");

                guest = new Guest
                {
                    NationalId = dto.NationalId,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    PhoneNumber = dto.PhoneNumber,
                    Type = dto.GuestType,
                    Company = dto.Company
                };
                guest = await _guestRepository.CreateAsync(guest);
            }

            var reservation = new Reservation
            {
                RoomId = dto.RoomId,
                GuestId = guest.Id,
                CheckInDate = dto.CheckInDate,
                IsActive = true
            };

            var createdReservation = await _reservationRepository.CreateAsync(reservation);

            room.Status = RoomStatus.Occupied;
            await _roomRepository.UpdateAsync(room);

            var result = await MapToDto(createdReservation);
            return ApiResponseDto<ReservationDto>.SuccessResponse(result, "Giriş işlemi başarıyla tamamlandı");
        }

        public async Task<ApiResponseDto<ReservationDto>> CheckOutAsync(CheckOutDto dto)
        {
            var reservation = await _reservationRepository.GetByIdAsync(dto.ReservationId);
            if (reservation == null)
                return ApiResponseDto<ReservationDto>.ErrorResponse("Rezervasyon bulunamadı");

            if (!reservation.IsActive)
                return ApiResponseDto<ReservationDto>.ErrorResponse("Bu rezervasyon zaten kapatılmış");

            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);

            reservation.CheckOutDate = dto.CheckOutDate;
            reservation.IsActive = false;
            await _reservationRepository.UpdateAsync(reservation);

            if (room != null)
            {
                room.Status = RoomStatus.Empty;
                await _roomRepository.UpdateAsync(room);
            }

            var result = await MapToDto(reservation);
            return ApiResponseDto<ReservationDto>.SuccessResponse(result, "Çıkış işlemi başarıyla tamamlandı");
        }

        private async Task<ReservationDto> MapToDto(Reservation reservation)
        {
            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

            return new ReservationDto
            {
                Id = reservation.Id,
                RoomId = reservation.RoomId,
                RoomNumber = room?.RoomNumber ?? 0,
                GuestId = reservation.GuestId,
                GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "Bilinmiyor",
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = reservation.CheckOutDate,
                IsActive = reservation.IsActive
            };
        }
    }
}
