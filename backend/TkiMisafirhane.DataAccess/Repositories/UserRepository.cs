using Google.Cloud.Firestore;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(FirestoreDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var query = _collection.WhereEqualTo("Username", username).Limit(1);
            var snapshot = await query.GetSnapshotAsync();

            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.Exists == true ? ConvertFromFirestore(doc) : null;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var query = _collection.WhereEqualTo("Email", email).Limit(1);
            var snapshot = await query.GetSnapshotAsync();

            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.Exists == true ? ConvertFromFirestore(doc) : null;
        }
    }
}
