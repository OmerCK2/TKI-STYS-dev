using TkiMisafirhane.Core.Entities;

namespace TkiMisafirhane.Core.Interfaces
{
    public interface IExtraChargeRepository : IRepository<ExtraCharge>
    {
        Task<IEnumerable<ExtraCharge>> GetByInvoiceIdAsync(string invoiceId);
    }
}
