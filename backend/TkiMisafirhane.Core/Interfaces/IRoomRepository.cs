using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IRoomRepository
    {
        Task<Room?> GetByIdAsync(string id);
        Task<Room?> GetByRoomNumberAsync(int roomNumber);
        Task<IEnumerable<Room>> GetAllAsync();
        Task<IEnumerable<Room>> GetByStatusAsync(RoomStatus status);
        Task<Room> CreateAsync(Room room);
        Task<Room> UpdateAsync(Room room);
        Task<bool> DeleteAsync(string id);
    }
}
