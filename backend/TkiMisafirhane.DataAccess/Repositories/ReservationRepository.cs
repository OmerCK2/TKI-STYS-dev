using Google.Cloud.Firestore;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public class ReservationRepository : BaseRepository<Reservation>, IReservationRepository
    {
        public ReservationRepository(FirestoreDbContext context) : base(context)
        {
        }

        public async Task<Reservation?> GetActiveByRoomIdAsync(string roomId)
        {
            var query = _collection
                .WhereEqualTo("RoomId", roomId)
                .WhereEqualTo("IsActive", true)
                .Limit(1);

            var snapshot = await query.GetSnapshotAsync();
            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.Exists == true ? ConvertFromFirestore(doc) : null;
        }

        public async Task<IEnumerable<Reservation>> GetActiveReservationsAsync()
        {
            var query = _collection.WhereEqualTo("IsActive", true);
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents
                .Where(doc => doc.Exists)
                .Select(ConvertFromFirestore)
                .ToList();
        }
    }
}
