using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.DTOs
{
    public class RoomDto
    {
        public string Id { get; set; } = string.Empty;
        public int RoomNumber { get; set; }
        public int Floor { get; set; }
        public int Capacity { get; set; }
        public decimal NightlyRateTki { get; set; }
        public decimal NightlyRateCivilian { get; set; }
        public RoomStatus Status { get; set; }
    }

    public class CreateRoomDto
    {
        public int RoomNumber { get; set; }
        public int Floor { get; set; }
        public int Capacity { get; set; }
        public decimal NightlyRateTki { get; set; }
        public decimal NightlyRateCivilian { get; set; }
    }

    public class UpdateRoomDto
    {
        public int Capacity { get; set; }
        public decimal NightlyRateTki { get; set; }
        public decimal NightlyRateCivilian { get; set; }
        public RoomStatus Status { get; set; }
    }

    public class RoomStatusUpdateDto
    {
        public RoomStatus Status { get; set; }
    }
}
