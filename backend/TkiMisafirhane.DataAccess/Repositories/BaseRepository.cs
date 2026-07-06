using Google.Cloud.Firestore;
using System.Reflection;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.Core.Specifications;
using TkiMisafirhane.DataAccess.Context;

namespace TkiMisafirhane.DataAccess.Repositories
{
    public abstract class BaseRepository<T> : IRepository<T> where T : class
    {
        protected readonly FirestoreDbContext _context;
        protected readonly CollectionReference _collection;

        private static readonly Dictionary<Type, string> CollectionNames = new()
        {
            { typeof(Core.Entities.Room), "rooms" },
            { typeof(Core.Entities.Guest), "guests" },
            { typeof(Core.Entities.Reservation), "reservations" },
            { typeof(Core.Entities.Invoice), "invoices" },
            { typeof(Core.Entities.ExtraCharge), "extraCharges" },
            { typeof(Core.Entities.User), "users" }
        };

        protected BaseRepository(FirestoreDbContext context)
        {
            _context = context;

            var collectionName = CollectionNames.TryGetValue(typeof(T), out var name)
                ? name
                : typeof(T).Name.ToLower() + "s";

            _collection = context.GetCollection(collectionName);
        }

        public virtual async Task<T?> GetByIdAsync(string id)
        {
            var document = _collection.Document(id);
            var snapshot = await document.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            return ConvertFromFirestore(snapshot);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            var snapshot = await _collection.GetSnapshotAsync();
            var results = new List<T>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    results.Add(ConvertFromFirestore(doc));
                }
            }
            return results;
        }

        public virtual async Task<T> CreateAsync(T entity)
        {
            var id = GetEntityId(entity);
            var document = _collection.Document(id);
            var data = ConvertToFirestore(entity);

            await document.SetAsync(data);
            return entity;
        }

        public virtual async Task<T> UpdateAsync(T entity)
        {
            var id = GetEntityId(entity);
            var document = _collection.Document(id);
            var data = ConvertToFirestore(entity);

            await document.SetAsync(data, SetOptions.Overwrite);
            return entity;
        }

        public virtual async Task<bool> DeleteAsync(string id)
        {
            var document = _collection.Document(id);
            var snapshot = await document.GetSnapshotAsync();

            if (!snapshot.Exists)
                return false;

            await document.DeleteAsync();
            return true;
        }

        public virtual async Task<IEnumerable<T>> GetWithSpecAsync(ISpecification<T> spec)
        {
            var allEntities = await GetAllAsync();

            if (spec.Criteria != null)
            {
                var func = spec.Criteria.Compile();
                return allEntities.Where(func).ToList();
            }

            return allEntities;
        }

        protected static string GetEntityId(T entity)
        {
            var idProperty = typeof(T).GetProperty("Id");
            var idValue = idProperty?.GetValue(entity)?.ToString();

            if (string.IsNullOrEmpty(idValue))
            {
                idValue = Guid.NewGuid().ToString();
                idProperty?.SetValue(entity, idValue);
            }

            return idValue;
        }

        protected static Dictionary<string, object> ConvertToFirestore(T entity)
        {
            var dict = new Dictionary<string, object>();
            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(entity);
                if (value == null) continue;

                if (prop.PropertyType.IsEnum)
                {
                    dict[prop.Name] = Convert.ToInt32(value);
                }
                else if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTime?))
                {
                    dict[prop.Name] = Timestamp.FromDateTime(((DateTime)value).ToUniversalTime());
                }
                else if (prop.PropertyType == typeof(decimal))
                {
                    dict[prop.Name] = Convert.ToDouble(value);
                }
                else
                {
                    dict[prop.Name] = value;
                }
            }

            return dict;
        }

        protected static T ConvertFromFirestore(DocumentSnapshot document)
        {
            var entity = Activator.CreateInstance<T>();
            var data = document.ToDictionary();

            foreach (var prop in typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!data.ContainsKey(prop.Name)) continue;

                var rawValue = data[prop.Name];

                try
                {
                    if (prop.PropertyType == typeof(string))
                    {
                        prop.SetValue(entity, rawValue?.ToString() ?? string.Empty);
                    }
                    else if (prop.PropertyType.IsEnum && rawValue is long enumInt)
                    {
                        prop.SetValue(entity, Enum.ToObject(prop.PropertyType, (int)enumInt));
                    }
                    else if (prop.PropertyType.IsEnum && rawValue is int enumInt2)
                    {
                        prop.SetValue(entity, Enum.ToObject(prop.PropertyType, enumInt2));
                    }
                    else if (prop.PropertyType == typeof(DateTime) && rawValue is Timestamp ts)
                    {
                        prop.SetValue(entity, ts.ToDateTime());
                    }
                    else if (prop.PropertyType == typeof(DateTime?) && rawValue is Timestamp tsNullable)
                    {
                        prop.SetValue(entity, tsNullable.ToDateTime());
                    }
                    else if (prop.PropertyType == typeof(decimal) && rawValue is double doubleVal)
                    {
                        prop.SetValue(entity, Convert.ToDecimal(doubleVal));
                    }
                    else if (prop.PropertyType == typeof(int) && rawValue is long longVal)
                    {
                        prop.SetValue(entity, (int)longVal);
                    }
                    else if (prop.PropertyType == typeof(bool) && rawValue is bool boolVal)
                    {
                        prop.SetValue(entity, boolVal);
                    }
                    else
                    {
                        prop.SetValue(entity, Convert.ChangeType(rawValue, prop.PropertyType));
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine(
                        $"[Firestore] Property '{prop.Name}' conversion failed for entity '{typeof(T).Name}': {ex.Message}");
                }
            }

            return entity;
        }
    }
}
