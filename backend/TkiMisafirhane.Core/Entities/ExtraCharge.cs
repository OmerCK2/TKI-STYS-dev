namespace TkiMisafirhane.Core.Entities
{
    public class ExtraCharge
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string InvoiceId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public Invoice? Invoice { get; set; }
    }
}
