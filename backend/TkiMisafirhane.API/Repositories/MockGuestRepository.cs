using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.Core.Specifications;

namespace TkiMisafirhane.API.Repositories
{
    public class MockGuestRepository : IGuestRepository
    {
        private static readonly ConcurrentDictionary<string, Guest> _guests = new();

        public MockGuestRepository()
        {
            if (_guests.IsEmpty)
            {
                SeedData();
            }
        }

        private void SeedData()
        {
            var guests = new List<Guest>
            {
                new() { Id = Guid.NewGuid().ToString(), NationalId = "12345678901", FirstName = "Ahmet", LastName = "Yılmaz", PhoneNumber = "5551234567", Type = GuestType.TkiPersonnel, Company = "TKİ" },
                new() { Id = Guid.NewGuid().ToString(), NationalId = "98765432109", FirstName = "Mehmet", LastName = "Kaya", PhoneNumber = "5559876543", Type = GuestType.Civilian },
                new() { Id = Guid.NewGuid().ToString(), NationalId = "55544466677", FirstName = "Ayşe", LastName = "Demir", PhoneNumber = "5554567890", Type = GuestType.TkiPersonnel, Company = "TKİ" },
            };

            foreach (var guest in guests)
            {
                _guests.TryAdd(guest.Id, guest);
            }
        }

        public Task<Guest?> GetByIdAsync(string id)
        {
            _guests.TryGetValue(id, out var guest);
            return Task.FromResult(guest);
        }

        public Task<Guest?> GetByNationalIdAsync(string nationalId)
        {
            var guest = _guests.Values.FirstOrDefault(g => g.NationalId == nationalId);
            return Task.FromResult(guest);
        }

        public Task<IEnumerable<Guest>> GetAllAsync()
        {
            return Task.FromResult(_guests.Values.AsEnumerable());
        }

        public Task<IEnumerable<Guest>> GetByTypeAsync(GuestType type)
        {
            var guests = _guests.Values.Where(g => g.Type == type);
            return Task.FromResult(guests);
        }

        public Task<Guest> CreateAsync(Guest guest)
        {
            guest.Id = Guid.NewGuid().ToString();
            guest.CreatedAt = DateTime.UtcNow;
            _guests.TryAdd(guest.Id, guest);
            return Task.FromResult(guest);
        }

        public Task<Guest> UpdateAsync(Guest guest)
        {
            _guests[guest.Id] = guest;
            return Task.FromResult(guest);
        }

        public Task<bool> DeleteAsync(string id)
        {
            return Task.FromResult(_guests.TryRemove(id, out _));
        }

        public Task<IEnumerable<Guest>> GetWithSpecAsync(ISpecification<Guest> spec)
        {
            var predicate = spec.Criteria.Compile();
            return Task.FromResult(_guests.Values.Where(predicate).AsEnumerable());
        }
    }
}
