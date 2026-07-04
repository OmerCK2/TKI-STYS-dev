using TkiMisafirhane.Core.Entities;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IExtraChargeRepository
    {
        Task<ExtraCharge?> GetByIdAsync(string id);
        Task<IEnumerable<ExtraCharge>> GetByInvoiceIdAsync(string invoiceId);
        Task<ExtraCharge> CreateAsync(ExtraCharge extraCharge);
        Task<bool> DeleteAsync(string id);
    }
}
