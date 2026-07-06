using Google.Cloud.Firestore;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public class ExtraChargeRepository : BaseRepository<ExtraCharge>, IExtraChargeRepository
    {
        public ExtraChargeRepository(FirestoreDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ExtraCharge>> GetByInvoiceIdAsync(string invoiceId)
        {
            var query = _collection.WhereEqualTo("InvoiceId", invoiceId);
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents
                .Where(doc => doc.Exists)
                .Select(ConvertFromFirestore)
                .ToList();
        }
    }
}
