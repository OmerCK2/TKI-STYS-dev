using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Entities
{
    public class Guest : BaseEntity
    {
        public string NationalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public GuestType Type { get; set; } = GuestType.Civilian;
        public string? Company { get; set; }
    }
}
