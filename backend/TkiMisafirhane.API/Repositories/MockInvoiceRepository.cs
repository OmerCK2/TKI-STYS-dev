using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Repositories
{
    public class MockInvoiceRepository : IInvoiceRepository
    {
        private static readonly ConcurrentDictionary<string, Invoice> _invoices = new();

        public Task<Invoice?> GetByIdAsync(string id)
        {
            _invoices.TryGetValue(id, out var invoice);
            return Task.FromResult(invoice);
        }

        public Task<Invoice?> GetByReservationIdAsync(string reservationId)
        {
            var invoice = _invoices.Values.FirstOrDefault(i => i.ReservationId == reservationId);
            return Task.FromResult(invoice);
        }

        public Task<IEnumerable<Invoice>> GetAllAsync()
        {
            return Task.FromResult(_invoices.Values.AsEnumerable());
        }

        public Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status)
        {
            var invoices = _invoices.Values.Where(i => i.Status == status);
            return Task.FromResult(invoices);
        }

        public Task<Invoice> CreateAsync(Invoice invoice)
        {
            invoice.Id = Guid.NewGuid().ToString();
            invoice.CreatedAt = DateTime.UtcNow;
            _invoices.TryAdd(invoice.Id, invoice);
            return Task.FromResult(invoice);
        }

        public Task<Invoice> UpdateAsync(Invoice invoice)
        {
            _invoices[invoice.Id] = invoice;
            return Task.FromResult(invoice);
        }

        public Task<bool> DeleteAsync(string id)
        {
            return Task.FromResult(_invoices.TryRemove(id, out _));
        }
    }
}
