using Google.Cloud.Firestore;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public class GuestRepository : BaseRepository<Guest>, IGuestRepository
    {
        public GuestRepository(FirestoreDbContext context) : base(context)
        {
        }

        public async Task<Guest?> GetByNationalIdAsync(string nationalId)
        {
            var query = _collection.WhereEqualTo("NationalId", nationalId).Limit(1);
            var snapshot = await query.GetSnapshotAsync();

            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.Exists == true ? ConvertFromFirestore(doc) : null;
        }

        public async Task<IEnumerable<Guest>> GetByTypeAsync(GuestType type)
        {
            var query = _collection.WhereEqualTo("Type", (int)type);
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents
                .Where(doc => doc.Exists)
                .Select(ConvertFromFirestore)
                .ToList();
        }
    }
}
