using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Entities
{
    public class Reservation : BaseEntity
    {
        public string RoomId { get; set; } = string.Empty;
        public string GuestId { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public bool IsActive { get; set; } = true;
        
        public Room? Room { get; set; }
        public Guest? Guest { get; set; }
    }
}
