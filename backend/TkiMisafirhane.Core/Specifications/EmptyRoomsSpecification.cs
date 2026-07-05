using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Specifications
{
    public class EmptyRoomsSpecification : BaseSpecification<Room>
    {
        public EmptyRoomsSpecification() 
            : base(r => r.Status == RoomStatus.Empty)
        {
        }
    }
}