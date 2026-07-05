using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IGuestRepository
    {
        Task<Guest?> GetByIdAsync(string id);
        Task<Guest?> GetByNationalIdAsync(string nationalId);
        Task<IEnumerable<Guest>> GetAllAsync();
        Task<IEnumerable<Guest>> GetByTypeAsync(GuestType type);
        Task<Guest> CreateAsync(Guest guest);
        Task<Guest> UpdateAsync(Guest guest);
        Task<bool> DeleteAsync(string id);
    }
}
