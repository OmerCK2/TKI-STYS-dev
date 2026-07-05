using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Repositories
{
    public class MockExtraChargeRepository : IExtraChargeRepository
    {
        private static readonly ConcurrentDictionary<string, ExtraCharge> _extraCharges = new();

        public Task<ExtraCharge?> GetByIdAsync(string id)
        {
            _extraCharges.TryGetValue(id, out var extraCharge);
            return Task.FromResult(extraCharge);
        }

        public Task<IEnumerable<ExtraCharge>> GetByInvoiceIdAsync(string invoiceId)
        {
            var extraCharges = _extraCharges.Values.Where(e => e.InvoiceId == invoiceId);
            return Task.FromResult(extraCharges);
        }

        public Task<ExtraCharge> CreateAsync(ExtraCharge extraCharge)
        {
            extraCharge.Id = Guid.NewGuid().ToString();
            extraCharge.CreatedAt = DateTime.UtcNow;
            _extraCharges.TryAdd(extraCharge.Id, extraCharge);
            return Task.FromResult(extraCharge);
        }

        public Task<bool> DeleteAsync(string id)
        {
            return Task.FromResult(_extraCharges.TryRemove(id, out _));
        }
    }
}
