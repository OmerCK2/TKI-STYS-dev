using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TkiMisafirhane.API.Hubs
{
    [Authorize]
    public class RoomHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected", "Oda durumu takibi başlatıldı");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinRoomGroup(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoomGroup(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task SendRoomStatusUpdate(object roomUpdate)
        {
            await Clients.All.SendAsync("RoomStatusUpdated", roomUpdate);
        }
    }
}
