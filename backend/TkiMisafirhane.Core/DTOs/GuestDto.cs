using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.DTOs
{
    public class GuestDto
    {
        public string Id { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public GuestType Type { get; set; }
        public string? Company { get; set; }
    }

    public class CreateGuestDto
    {
        public string NationalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public GuestType Type { get; set; }
        public string? Company { get; set; }
    }
}
