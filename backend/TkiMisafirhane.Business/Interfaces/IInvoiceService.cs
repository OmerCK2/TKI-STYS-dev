using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Enums;

namespace TkiMisafirhane.Business.Interfaces
{
    public interface IInvoiceService
    {
        Task<ApiResponseDto<IEnumerable<InvoiceDto>>> GetAllInvoicesAsync();
        Task<ApiResponseDto<InvoiceDto>> GetInvoiceByIdAsync(string id);
        Task<ApiResponseDto<InvoiceDto>> GetInvoiceByReservationIdAsync(string reservationId);
        Task<ApiResponseDto<IEnumerable<InvoiceDto>>> GetInvoicesByStatusAsync(InvoiceStatus status);
        Task<ApiResponseDto<InvoiceDto>> GenerateInvoiceAsync(string reservationId);
        Task<ApiResponseDto<InvoiceDto>> AddExtraChargeAsync(string invoiceId, CreateExtraChargeDto dto);
        Task<ApiResponseDto<InvoiceDto>> UpdateInvoiceStatusAsync(string id, InvoiceStatus status);
        Task<byte[]> GenerateInvoicePdfAsync(string invoiceId);
    }
}
