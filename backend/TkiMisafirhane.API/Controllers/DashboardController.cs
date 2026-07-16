using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IInvoiceRepository _invoiceRepository;

        public DashboardController(
            IRoomRepository roomRepository,
            IReservationRepository reservationRepository,
            IGuestRepository guestRepository,
            IInvoiceRepository invoiceRepository)
        {
            _roomRepository = roomRepository;
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _invoiceRepository = invoiceRepository;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseDto<DashboardDto>>> GetDashboard()
        {
            var rooms = (await _roomRepository.GetAllAsync()).ToList();
            var reservations = (await _reservationRepository.GetAllAsync()).ToList();
            var guests = (await _guestRepository.GetAllAsync()).ToList();
            var invoices = (await _invoiceRepository.GetAllAsync()).ToList();

            var activeReservations = reservations.Where(r => r.IsActive).ToList();
            var today = DateTime.UtcNow.Date;

            var todayCheckIns = reservations.Count(r =>
                r.CheckInDate.Date == today);
            var todayCheckOuts = reservations.Count(r =>
                r.CheckOutDate.HasValue && r.CheckOutDate.Value.Date == today);

            var totalRevenue = invoices.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.TotalAmount);
            var pendingRevenue = invoices.Where(i => i.Status == InvoiceStatus.Pending).Sum(i => i.TotalAmount);

            var recentReservations = activeReservations
                .OrderByDescending(r => r.CheckInDate)
                .Take(5)
                .Select(r =>
                {
                    var room = rooms.FirstOrDefault(rm => rm.Id == r.RoomId);
                    var guest = guests.FirstOrDefault(g => g.Id == r.GuestId);
                    return new RecentActivityDto
                    {
                        Type = "check-in",
                        Description = $"{guest?.FirstName} {guest?.LastName} - Oda {room?.RoomNumber}",
                        Timestamp = r.CheckInDate,
                        RoomNumber = room?.RoomNumber ?? 0
                    };
                }).ToList();

            var completedToday = reservations
                .Where(r => r.CheckOutDate.HasValue && r.CheckOutDate.Value.Date == today)
                .OrderByDescending(r => r.CheckOutDate)
                .Take(5)
                .Select(r =>
                {
                    var room = rooms.FirstOrDefault(rm => rm.Id == r.RoomId);
                    var guest = guests.FirstOrDefault(g => g.Id == r.GuestId);
                    return new RecentActivityDto
                    {
                        Type = "check-out",
                        Description = $"{guest?.FirstName} {guest?.LastName} - Oda {room?.RoomNumber}",
                        Timestamp = r.CheckOutDate!.Value,
                        RoomNumber = room?.RoomNumber ?? 0
                    };
                }).ToList();

            var allActivities = recentReservations.Concat(completedToday)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .ToList();

            var floorOccupancy = rooms.GroupBy(r => r.Floor)
                .Select(g => new FloorOccupancyDto
                {
                    Floor = g.Key,
                    Total = g.Count(),
                    Occupied = g.Count(r => r.Status == RoomStatus.Occupied),
                    Reserved = g.Count(r => r.Status == RoomStatus.Reserved),
                    Empty = g.Count(r => r.Status == RoomStatus.Empty),
                    Maintenance = g.Count(r => r.Status == RoomStatus.Maintenance)
                })
                .OrderBy(f => f.Floor)
                .ToList();

            var dashboard = new DashboardDto
            {
                TotalRooms = rooms.Count,
                OccupiedRooms = rooms.Count(r => r.Status == RoomStatus.Occupied),
                EmptyRooms = rooms.Count(r => r.Status == RoomStatus.Empty),
                ReservedRooms = rooms.Count(r => r.Status == RoomStatus.Reserved),
                MaintenanceRooms = rooms.Count(r => r.Status == RoomStatus.Maintenance),
                OccupancyRate = rooms.Count > 0
                    ? Math.Round((double)rooms.Count(r => r.Status == RoomStatus.Occupied) / rooms.Count * 100, 1)
                    : 0,
                ActiveGuests = activeReservations.Count,
                TotalGuests = guests.Count,
                TodayCheckIns = todayCheckIns,
                TodayCheckOuts = todayCheckOuts,
                TotalRevenue = totalRevenue,
                PendingRevenue = pendingRevenue,
                RecentActivities = allActivities,
                FloorOccupancy = floorOccupancy
            };

            return Ok(ApiResponseDto<DashboardDto>.SuccessResponse(dashboard));
        }
    }

    public class DashboardDto
    {
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int EmptyRooms { get; set; }
        public int ReservedRooms { get; set; }
        public int MaintenanceRooms { get; set; }
        public double OccupancyRate { get; set; }
        public int ActiveGuests { get; set; }
        public int TotalGuests { get; set; }
        public int TodayCheckIns { get; set; }
        public int TodayCheckOuts { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal PendingRevenue { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public List<FloorOccupancyDto> FloorOccupancy { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int RoomNumber { get; set; }
    }

    public class FloorOccupancyDto
    {
        public int Floor { get; set; }
        public int Total { get; set; }
        public int Occupied { get; set; }
        public int Reserved { get; set; }
        public int Empty { get; set; }
        public int Maintenance { get; set; }
    }
}
