using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.DTOs
{
    public class InvoiceDto
    {
        public string Id { get; set; } = string.Empty;
        public string ReservationId { get; set; } = string.Empty;
        public string GuestId { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public string GuestNationalId { get; set; } = string.Empty;
        public GuestType GuestType { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfNights { get; set; }
        public decimal NightlyRate { get; set; }
        public decimal AccommodationCost { get; set; }
        public decimal ExtrasCost { get; set; }
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; }
        public string? Notes { get; set; }
        public List<ExtraChargeDto> Extras { get; set; } = new();
    }

    public class ExtraChargeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class CreateExtraChargeDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class InvoiceStatusUpdateDto
    {
        public InvoiceStatus Status { get; set; }
    }
}
