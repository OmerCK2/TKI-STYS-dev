using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Entities
{
    public class Guest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string NationalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public GuestType Type { get; set; } = GuestType.Civilian;
        public string? Company { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
