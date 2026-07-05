using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IGuestRepository : IRepository<Guest>
    {
        Task<Guest?> GetByNationalIdAsync(string nationalId);
        Task<IEnumerable<Guest>> GetByTypeAsync(GuestType type);
    }
}
