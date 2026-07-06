using Google.Cloud.Firestore;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public class InvoiceRepository : BaseRepository<Invoice>, IInvoiceRepository
    {
        public InvoiceRepository(FirestoreDbContext context) : base(context)
        {
        }

        public async Task<Invoice?> GetByReservationIdAsync(string reservationId)
        {
            var query = _collection.WhereEqualTo("ReservationId", reservationId).Limit(1);
            var snapshot = await query.GetSnapshotAsync();

            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.Exists == true ? ConvertFromFirestore(doc) : null;
        }

        public async Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status)
        {
            var query = _collection.WhereEqualTo("Status", (int)status);
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents
                .Where(doc => doc.Exists)
                .Select(ConvertFromFirestore)
                .ToList();
        }
    }
}
