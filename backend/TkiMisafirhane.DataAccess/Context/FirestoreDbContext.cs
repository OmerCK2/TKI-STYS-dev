using Google.Cloud.Firestore;

namespace TkiMisafirhane.DataAccess.Context
{
    public class FirestoreDbContext
    {
        private readonly FirestoreDb _firestoreDb;

        public FirestoreDb Database => _firestoreDb;

        public FirestoreDbContext(string projectId, string credentialsPath)
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
            _firestoreDb = FirestoreDb.Create(projectId);
        }

        public FirestoreDbContext(string projectId)
        {
            _firestoreDb = FirestoreDb.Create(projectId);
        }

        public CollectionReference GetCollection(string collectionName)
        {
            return _firestoreDb.Collection(collectionName);
        }
    }
}
