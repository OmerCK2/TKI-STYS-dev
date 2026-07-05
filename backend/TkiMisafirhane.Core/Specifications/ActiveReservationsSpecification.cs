using System;
using TkiMisafirhane.Core.Entities;

namespace TkiMisafirhane.Core.Specifications
{
    public class ActiveReservationsSpecification : BaseSpecification<Reservation>
    {
        public ActiveReservationsSpecification() 
            : base(r => r.IsActive && r.CheckInDate <= DateTime.UtcNow)
        {
        }
    }
}