using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Specifications
{
    public class TkiPersonnelGuestsSpecification : BaseSpecification<Guest>
    {
        public TkiPersonnelGuestsSpecification() 
            : base(g => g.Type == GuestType.TkiPersonnel)
        {
        }
    }
}