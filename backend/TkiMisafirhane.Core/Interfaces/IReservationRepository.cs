using TkiMisafirhane.Core.Entities;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IReservationRepository : IRepository<Reservation>
    {
        Task<Reservation?> GetActiveByRoomIdAsync(string roomId);
        Task<IEnumerable<Reservation>> GetActiveReservationsAsync();
    }
}
