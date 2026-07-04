using System.Collections.Concurrent;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Repositories
{
    public class MockUserRepository : IUserRepository
    {
        private static readonly ConcurrentDictionary<string, User> _users = new();

        public MockUserRepository()
        {
            if (_users.IsEmpty)
            {
                SeedData();
            }
        }

        private void SeedData()
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Username = "admin",
                Email = "admin@tki.gov.tr",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "User",
                IsActive = true,
                IsAdmin = true,
                RequiresPasswordChange = false
            };
            _users.TryAdd(adminUser.Id, adminUser);
        }

        public Task<User?> GetByIdAsync(string id)
        {
            _users.TryGetValue(id, out var user);
            return Task.FromResult(user);
        }

        public Task<User?> GetByUsernameAsync(string username)
        {
            var user = _users.Values.FirstOrDefault(u => u.Username == username);
            return Task.FromResult(user);
        }

        public Task<User?> GetByEmailAsync(string email)
        {
            var user = _users.Values.FirstOrDefault(u => u.Email == email);
            return Task.FromResult(user);
        }

        public Task<IEnumerable<User>> GetAllAsync()
        {
            return Task.FromResult(_users.Values.AsEnumerable());
        }

        public Task<User> CreateAsync(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            user.CreatedAt = DateTime.UtcNow;
            _users.TryAdd(user.Id, user);
            return Task.FromResult(user);
        }

        public Task<User> UpdateAsync(User user)
        {
            _users[user.Id] = user;
            return Task.FromResult(user);
        }
    }
}
