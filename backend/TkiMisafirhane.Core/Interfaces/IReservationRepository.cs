using TkiMisafirhane.Core.Entities;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IReservationRepository
    {
        Task<Reservation?> GetByIdAsync(string id);
        Task<Reservation?> GetActiveByRoomIdAsync(string roomId);
        Task<IEnumerable<Reservation>> GetAllAsync();
        Task<IEnumerable<Reservation>> GetActiveReservationsAsync();
        Task<Reservation> CreateAsync(Reservation reservation);
        Task<Reservation> UpdateAsync(Reservation reservation);
        Task<bool> DeleteAsync(string id);
    }
}
