using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Entities
{
    public class Invoice
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ReservationId { get; set; } = string.Empty;
        public string GuestId { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfNights { get; set; }
        public decimal NightlyRate { get; set; }
        public decimal AccommodationCost { get; set; }
        public decimal ExtrasCost { get; set; }
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public Reservation? Reservation { get; set; }
        public Guest? Guest { get; set; }
    }
}
