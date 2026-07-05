using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.Core.Specifications;

namespace TkiMisafirhane.API.Repositories
{
    public class MockReservationRepository : IReservationRepository
    {
        private static readonly ConcurrentDictionary<string, Reservation> _reservations = new();

        public MockReservationRepository()
        {
            if (_reservations.IsEmpty)
            {
                SeedData();
            }
        }

        private void SeedData()
        {
            var reservations = new List<Reservation>
            {
                new() { Id = Guid.NewGuid().ToString(), RoomId = "room-2", GuestId = "guest-1", CheckInDate = DateTime.UtcNow.AddDays(-2), IsActive = true },
            };

            foreach (var reservation in reservations)
            {
                _reservations.TryAdd(reservation.Id, reservation);
            }
        }

        public Task<Reservation?> GetByIdAsync(string id)
        {
            _reservations.TryGetValue(id, out var reservation);
            return Task.FromResult(reservation);
        }

        public Task<Reservation?> GetActiveByRoomIdAsync(string roomId)
        {
            var reservation = _reservations.Values.FirstOrDefault(r => r.RoomId == roomId && r.IsActive);
            return Task.FromResult(reservation);
        }

        public Task<IEnumerable<Reservation>> GetAllAsync()
        {
            return Task.FromResult(_reservations.Values.AsEnumerable());
        }

        public Task<IEnumerable<Reservation>> GetActiveReservationsAsync()
        {
            var reservations = _reservations.Values.Where(r => r.IsActive);
            return Task.FromResult(reservations);
        }

        public Task<Reservation> CreateAsync(Reservation reservation)
        {
            reservation.Id = Guid.NewGuid().ToString();
            reservation.CreatedAt = DateTime.UtcNow;
            _reservations.TryAdd(reservation.Id, reservation);
            return Task.FromResult(reservation);
        }

        public Task<Reservation> UpdateAsync(Reservation reservation)
        {
            _reservations[reservation.Id] = reservation;
            return Task.FromResult(reservation);
        }

        public Task<bool> DeleteAsync(string id)
        {
            return Task.FromResult(_reservations.TryRemove(id, out _));
        }

        public Task<IEnumerable<Reservation>> GetWithSpecAsync(ISpecification<Reservation> spec)
        {
            var predicate = spec.Criteria.Compile();
            return Task.FromResult(_reservations.Values.Where(predicate).AsEnumerable());
        }
    }
}
