using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IExtraChargeRepository _extraChargeRepository;
        private readonly Business.Interfaces.IInvoiceService _invoiceService;

        public InvoiceController(
            IInvoiceRepository invoiceRepository,
            IReservationRepository reservationRepository,
            IGuestRepository guestRepository,
            IRoomRepository roomRepository,
            IExtraChargeRepository extraChargeRepository,
            Business.Interfaces.IInvoiceService invoiceService)
        {
            _invoiceRepository = invoiceRepository;
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _extraChargeRepository = extraChargeRepository;
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<InvoiceDto>>>> GetAll()
        {
            var invoices = await _invoiceRepository.GetAllAsync();
            var invoiceDtos = new List<InvoiceDto>();

            foreach (var invoice in invoices)
            {
                invoiceDtos.Add(await MapToDto(invoice));
            }

            return Ok(ApiResponseDto<IEnumerable<InvoiceDto>>.SuccessResponse(invoiceDtos));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponseDto<InvoiceDto>>> GetById(string id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı"));
            }
            return Ok(ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice)));
        }

        [HttpGet("reservation/{reservationId}")]
        public async Task<ActionResult<ApiResponseDto<InvoiceDto>>> GetByReservationId(string reservationId)
        {
            var invoice = await _invoiceRepository.GetByReservationIdAsync(reservationId);
            if (invoice == null)
            {
                return NotFound(ApiResponseDto<InvoiceDto>.ErrorResponse("Bu rezervasyona ait fatura bulunamadı"));
            }
            return Ok(ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice)));
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponseDto<IEnumerable<InvoiceDto>>>> GetByStatus(InvoiceStatus status)
        {
            var invoices = await _invoiceRepository.GetByStatusAsync(status);
            var invoiceDtos = new List<InvoiceDto>();

            foreach (var invoice in invoices)
            {
                invoiceDtos.Add(await MapToDto(invoice));
            }

            return Ok(ApiResponseDto<IEnumerable<InvoiceDto>>.SuccessResponse(invoiceDtos));
        }

        [HttpPost("generate/{reservationId}")]
        public async Task<ActionResult<ApiResponseDto<InvoiceDto>>> GenerateInvoice(string reservationId)
        {
            var reservation = await _reservationRepository.GetByIdAsync(reservationId);
            if (reservation == null)
            {
                return NotFound(ApiResponseDto<InvoiceDto>.ErrorResponse("Rezervasyon bulunamadı"));
            }

            if (reservation.IsActive)
            {
                return BadRequest(ApiResponseDto<InvoiceDto>.ErrorResponse("Aktif rezervasyon için fatura oluşturulamaz"));
            }

            var existingInvoice = await _invoiceRepository.GetByReservationIdAsync(reservationId);
            if (existingInvoice != null)
            {
                return BadRequest(ApiResponseDto<InvoiceDto>.ErrorResponse("Bu rezervasyon için zaten bir fatura mevcut"));
            }

            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

            if (room == null || guest == null)
            {
                return BadRequest(ApiResponseDto<InvoiceDto>.ErrorResponse("Oda veya misafir bilgisi bulunamadı"));
            }

            var checkOutDate = reservation.CheckOutDate ?? DateTime.UtcNow;
            var numberOfNights = (int)(checkOutDate - reservation.CheckInDate).TotalDays;
            if (numberOfNights < 1) numberOfNights = 1;

            var nightlyRate = guest.Type == GuestType.TkiPersonnel ? room.NightlyRateTki : room.NightlyRateCivilian;
            var accommodationCost = numberOfNights * nightlyRate;

            var invoice = new Invoice
            {
                ReservationId = reservationId,
                GuestId = guest.Id,
                IssueDate = DateTime.UtcNow,
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = checkOutDate,
                NumberOfNights = numberOfNights,
                NightlyRate = nightlyRate,
                AccommodationCost = accommodationCost,
                ExtrasCost = 0,
                TotalAmount = accommodationCost,
                Status = InvoiceStatus.Pending
            };

            var createdInvoice = await _invoiceRepository.CreateAsync(invoice);
            return CreatedAtAction(nameof(GetById), new { id = createdInvoice.Id },
                ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(createdInvoice), "Fatura başarıyla oluşturuldu"));
        }

        [HttpPost("{id}/extras")]
        public async Task<ActionResult<ApiResponseDto<InvoiceDto>>> AddExtraCharge(string id, [FromBody] CreateExtraChargeDto extraChargeDto)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı"));
            }

            if (invoice.Status != InvoiceStatus.Pending)
            {
                return BadRequest(ApiResponseDto<InvoiceDto>.ErrorResponse("Ödenmiş veya iptal edilmiş faturaya ekleme yapılamaz"));
            }

            var extraCharge = new ExtraCharge
            {
                InvoiceId = id,
                Description = extraChargeDto.Description,
                Amount = extraChargeDto.Amount
            };

            await _extraChargeRepository.CreateAsync(extraCharge);

            invoice.ExtrasCost += extraChargeDto.Amount;
            invoice.TotalAmount = invoice.AccommodationCost + invoice.ExtrasCost;
            await _invoiceRepository.UpdateAsync(invoice);

            return Ok(ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice), "Ekstra harcama başarıyla eklendi"));
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponseDto<InvoiceDto>>> UpdateStatus(string id, [FromBody] InvoiceStatus status)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı"));
            }

            invoice.Status = status;
            await _invoiceRepository.UpdateAsync(invoice);

            return Ok(ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice), "Fatura durumu güncellendi"));
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetInvoicePdf(string id)
        {
            try
            {
                var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(id);
                return File(pdfBytes, "application/pdf", $"fatura-{id[..8]}.pdf");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        private async Task<InvoiceDto> MapToDto(Invoice invoice)
        {
            var guest = await _guestRepository.GetByIdAsync(invoice.GuestId);
            var extras = await _extraChargeRepository.GetByInvoiceIdAsync(invoice.Id);

            return new InvoiceDto
            {
                Id = invoice.Id,
                ReservationId = invoice.ReservationId,
                GuestId = invoice.GuestId,
                GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "Bilinmiyor",
                GuestNationalId = guest?.NationalId ?? "",
                GuestType = guest?.Type ?? GuestType.Civilian,
                IssueDate = invoice.IssueDate,
                CheckInDate = invoice.CheckInDate,
                CheckOutDate = invoice.CheckOutDate,
                NumberOfNights = invoice.NumberOfNights,
                NightlyRate = invoice.NightlyRate,
                AccommodationCost = invoice.AccommodationCost,
                ExtrasCost = invoice.ExtrasCost,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                Notes = invoice.Notes,
                Extras = extras.Select(e => new ExtraChargeDto
                {
                    Id = e.Id,
                    Description = e.Description,
                    Amount = e.Amount
                }).ToList()
            };
        }
    }
}
