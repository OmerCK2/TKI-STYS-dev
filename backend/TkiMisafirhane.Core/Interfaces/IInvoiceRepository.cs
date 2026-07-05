using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IInvoiceRepository : IRepository<Invoice>
    {
        Task<Invoice?> GetByReservationIdAsync(string reservationId);
        Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
    }
}
