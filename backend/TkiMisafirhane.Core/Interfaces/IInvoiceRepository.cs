using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<Invoice?> GetByIdAsync(string id);
        Task<Invoice?> GetByReservationIdAsync(string reservationId);
        Task<IEnumerable<Invoice>> GetAllAsync();
        Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
        Task<Invoice> CreateAsync(Invoice invoice);
        Task<Invoice> UpdateAsync(Invoice invoice);
        Task<bool> DeleteAsync(string id);
    }
}
