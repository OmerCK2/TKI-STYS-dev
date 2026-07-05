namespace TkiMisafirhane.Core.Entities
{
    public class ExtraCharge : BaseEntity
    {
        public string InvoiceId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public Invoice? Invoice { get; set; }
    }
}
