using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Entities
{
    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public int RoomNumber { get; set; }
        public int Floor { get; set; }
        public int Capacity { get; set; }
        public decimal NightlyRateTki { get; set; }
        public decimal NightlyRateCivilian { get; set; }
        public RoomStatus Status { get; set; } = RoomStatus.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
