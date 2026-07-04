using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Repositories
{
    public class MockRoomRepository : IRoomRepository
    {
        private static readonly ConcurrentDictionary<string, Room> _rooms = new();

        public MockRoomRepository()
        {
            if (_rooms.IsEmpty)
            {
                SeedData();
            }
        }

        private void SeedData()
        {
            var rooms = new List<Room>
            {
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 101, Floor = 1, Capacity = 2, NightlyRateTki = 500m, NightlyRateCivilian = 800m, Status = RoomStatus.Empty },
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 102, Floor = 1, Capacity = 2, NightlyRateTki = 500m, NightlyRateCivilian = 800m, Status = RoomStatus.Occupied },
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 103, Floor = 1, Capacity = 3, NightlyRateTki = 700m, NightlyRateCivilian = 1000m, Status = RoomStatus.Empty },
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 201, Floor = 2, Capacity = 2, NightlyRateTki = 600m, NightlyRateCivilian = 900m, Status = RoomStatus.Reserved },
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 202, Floor = 2, Capacity = 4, NightlyRateTki = 900m, NightlyRateCivilian = 1300m, Status = RoomStatus.Empty },
                new() { Id = Guid.NewGuid().ToString(), RoomNumber = 203, Floor = 2, Capacity = 1, NightlyRateTki = 400m, NightlyRateCivilian = 600m, Status = RoomStatus.Maintenance },
            };

            foreach (var room in rooms)
            {
                _rooms.TryAdd(room.Id, room);
            }
        }

        public Task<Room?> GetByIdAsync(string id)
        {
            _rooms.TryGetValue(id, out var room);
            return Task.FromResult(room);
        }

        public Task<Room?> GetByRoomNumberAsync(int roomNumber)
        {
            var room = _rooms.Values.FirstOrDefault(r => r.RoomNumber == roomNumber);
            return Task.FromResult(room);
        }

        public Task<IEnumerable<Room>> GetAllAsync()
        {
            return Task.FromResult(_rooms.Values.AsEnumerable());
        }

        public Task<IEnumerable<Room>> GetByStatusAsync(RoomStatus status)
        {
            var rooms = _rooms.Values.Where(r => r.Status == status);
            return Task.FromResult(rooms);
        }

        public Task<Room> CreateAsync(Room room)
        {
            room.Id = Guid.NewGuid().ToString();
            room.CreatedAt = DateTime.UtcNow;
            _rooms.TryAdd(room.Id, room);
            return Task.FromResult(room);
        }

        public Task<Room> UpdateAsync(Room room)
        {
            room.UpdatedAt = DateTime.UtcNow;
            _rooms[room.Id] = room;
            return Task.FromResult(room);
        }

        public Task<bool> DeleteAsync(string id)
        {
            return Task.FromResult(_rooms.TryRemove(id, out _));
        }
    }
}
