using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IRoomRepository : IRepository<Room>
    {
        Task<Room?> GetByRoomNumberAsync(int roomNumber);
        Task<IEnumerable<Room>> GetByStatusAsync(RoomStatus status);
    }
}
