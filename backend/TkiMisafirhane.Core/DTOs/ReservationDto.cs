namespace TkiMisafirhane.Core.DTOs
{
    public class ReservationDto
    {
        public string Id { get; set; } = string.Empty;
        public string RoomId { get; set; } = string.Empty;
        public int RoomNumber { get; set; }
        public string GuestId { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class CheckInDto
    {
        public string RoomId { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public TkiMisafirhane.Core.Enums.GuestType GuestType { get; set; }
        public string? Company { get; set; }
        public DateTime CheckInDate { get; set; } = DateTime.UtcNow;
    }

    public class CheckOutDto
    {
        public string ReservationId { get; set; } = string.Empty;
        public DateTime CheckOutDate { get; set; } = DateTime.UtcNow;
        public List<ExtraChargeDto>? Extras { get; set; }
    }
}
