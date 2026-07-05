using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Core.Specifications
{
    public class PendingInvoicesSpecification : BaseSpecification<Invoice>
    {
        public PendingInvoicesSpecification() 
            : base(i => i.Status == InvoiceStatus.Pending)
        {
        }
    }
}