using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TkiMisafirhane.Business.Interfaces;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Entities;
using TkiMisafirhane.Core.Enums;
using TkiMisafirhane.Core.Interfaces;

namespace TkiMisafirhane.Business.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IExtraChargeRepository _extraChargeRepository;

        public InvoiceService(
            IInvoiceRepository invoiceRepository,
            IReservationRepository reservationRepository,
            IGuestRepository guestRepository,
            IRoomRepository roomRepository,
            IExtraChargeRepository extraChargeRepository)
        {
            _invoiceRepository = invoiceRepository;
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _extraChargeRepository = extraChargeRepository;
        }

        public async Task<ApiResponseDto<IEnumerable<InvoiceDto>>> GetAllInvoicesAsync()
        {
            var invoices = await _invoiceRepository.GetAllAsync();
            var dtos = new List<InvoiceDto>();
            foreach (var invoice in invoices)
            {
                dtos.Add(await MapToDto(invoice));
            }
            return ApiResponseDto<IEnumerable<InvoiceDto>>.SuccessResponse(dtos);
        }

        public async Task<ApiResponseDto<InvoiceDto>> GetInvoiceByIdAsync(string id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı");
            return ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice));
        }

        public async Task<ApiResponseDto<InvoiceDto>> GetInvoiceByReservationIdAsync(string reservationId)
        {
            var invoice = await _invoiceRepository.GetByReservationIdAsync(reservationId);
            if (invoice == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Bu rezervasyona ait fatura bulunamadı");
            return ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice));
        }

        public async Task<ApiResponseDto<IEnumerable<InvoiceDto>>> GetInvoicesByStatusAsync(InvoiceStatus status)
        {
            var invoices = await _invoiceRepository.GetByStatusAsync(status);
            var dtos = new List<InvoiceDto>();
            foreach (var invoice in invoices)
            {
                dtos.Add(await MapToDto(invoice));
            }
            return ApiResponseDto<IEnumerable<InvoiceDto>>.SuccessResponse(dtos);
        }

        public async Task<ApiResponseDto<InvoiceDto>> GenerateInvoiceAsync(string reservationId)
        {
            var reservation = await _reservationRepository.GetByIdAsync(reservationId);
            if (reservation == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Rezervasyon bulunamadı");

            if (reservation.IsActive)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Aktif rezervasyon için fatura oluşturulamaz");

            var existingInvoice = await _invoiceRepository.GetByReservationIdAsync(reservationId);
            if (existingInvoice != null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Bu rezervasyon için zaten bir fatura mevcut");

            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            var guest = await _guestRepository.GetByIdAsync(reservation.GuestId);

            if (room == null || guest == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Oda veya misafir bilgisi bulunamadı");

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
            return ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(createdInvoice), "Fatura başarıyla oluşturuldu");
        }

        public async Task<ApiResponseDto<InvoiceDto>> AddExtraChargeAsync(string invoiceId, CreateExtraChargeDto dto)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı");

            if (invoice.Status != InvoiceStatus.Pending)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Ödenmiş veya iptal edilmiş faturaya ekleme yapılamaz");

            var extraCharge = new ExtraCharge
            {
                InvoiceId = invoiceId,
                Description = dto.Description,
                Amount = dto.Amount
            };

            await _extraChargeRepository.CreateAsync(extraCharge);

            invoice.ExtrasCost += dto.Amount;
            invoice.TotalAmount = invoice.AccommodationCost + invoice.ExtrasCost;
            await _invoiceRepository.UpdateAsync(invoice);

            return ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice), "Ekstra harcama başarıyla eklendi");
        }

        public async Task<ApiResponseDto<InvoiceDto>> UpdateInvoiceStatusAsync(string id, InvoiceStatus status)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
                return ApiResponseDto<InvoiceDto>.ErrorResponse("Fatura bulunamadı");

            invoice.Status = status;
            await _invoiceRepository.UpdateAsync(invoice);

            return ApiResponseDto<InvoiceDto>.SuccessResponse(await MapToDto(invoice), "Fatura durumu güncellendi");
        }

        public async Task<byte[]> GenerateInvoicePdfAsync(string invoiceId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null)
                throw new InvalidOperationException("Fatura bulunamadı");

            var guest = await _guestRepository.GetByIdAsync(invoice.GuestId);
            var extras = await _extraChargeRepository.GetByInvoiceIdAsync(invoiceId);

            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);

                    page.Header().Element(header =>
                    {
                        header.Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("TÜRKİYE KÖMÜR İŞLETMELERİ").Bold().FontSize(16).FontColor(Colors.Blue.Medium);
                                col.Item().Text("Sosyal Tesis Yönetim Sistemi").FontSize(10).FontColor(Colors.Grey.Medium);
                            });

                            row.RelativeItem().AlignRight().Column(col =>
                            {
                                col.Item().Text($"FATURA NO: {invoice.Id[..8].ToUpper()}").Bold().FontSize(10);
                                col.Item().Text($"Tarih: {invoice.IssueDate:dd/MM/yyyy}").FontSize(9);
                            });
                        });
                    });

                    page.Content().Element(content =>
                    {
                        content.PaddingVertical(10).Column(col =>
                        {
                            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten3);

                            col.Item().PaddingVertical(10).Row(row =>
                            {
                                row.RelativeItem().Column(guestCol =>
                                {
                                    guestCol.Item().Text("MÜŞTERİ BİLGİLERİ").Bold().FontSize(11).FontColor(Colors.Blue.Medium);
                                    guestCol.Item().Text($"Ad Soyad: {guest?.FirstName} {guest?.LastName}");
                                    guestCol.Item().Text($"TC Kimlik: {guest?.NationalId}");
                                    guestCol.Item().Text($"Telefon: {guest?.PhoneNumber}");
                                    guestCol.Item().Text($"Müşteri Tipi: {(guest?.Type == GuestType.TkiPersonnel ? "TKİ Personeli" : "Sivil")}");
                                    if (!string.IsNullOrEmpty(guest?.Company))
                                        guestCol.Item().Text($"Kurum: {guest.Company}");
                                });

                                row.RelativeItem().Column(stayCol =>
                                {
                                    stayCol.Item().Text("KONAKLAMA BİLGİLERİ").Bold().FontSize(11).FontColor(Colors.Blue.Medium);
                                    stayCol.Item().Text($"Giriş Tarihi: {invoice.CheckInDate:dd/MM/yyyy}");
                                    stayCol.Item().Text($"Çıkış Tarihi: {invoice.CheckOutDate:dd/MM/yyyy}");
                                    stayCol.Item().Text($"Toplam Gece: {invoice.NumberOfNights}");
                                    stayCol.Item().Text($"Gecelik Ücret: {invoice.NightlyRate:N2} TL");
                                });
                            });

                            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten3);

                            col.Item().PaddingVertical(10).Column(table =>
                            {
                                table.Item().Text("HARÇLAMA DETAYLARI").Bold().FontSize(11).FontColor(Colors.Blue.Medium);

                                table.Item().PaddingTop(5).Table(t =>
                                {
                                    t.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(3);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                    });

                                    t.Header(header =>
                                    {
                                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Açıklama").Bold().FontColor(Colors.White);
                                        header.Cell().Background(Colors.Blue.Medium).Padding(5).AlignCenter().Text("Miktar").Bold().FontColor(Colors.White);
                                        header.Cell().Background(Colors.Blue.Medium).Padding(5).AlignRight().Text("Tutar").Bold().FontColor(Colors.White);
                                    });

                                    t.Cell().Padding(5).Text($"{invoice.NumberOfNights} gece x {invoice.NightlyRate:N2} TL");
                                    t.Cell().Padding(5).AlignCenter().Text($"{invoice.NumberOfNights}");
                                    t.Cell().Padding(5).AlignRight().Text($"{invoice.AccommodationCost:N2} TL");

                                    foreach (var extra in extras)
                                    {
                                        t.Cell().Padding(5).Text(extra.Description);
                                        t.Cell().Padding(5).AlignCenter().Text("1");
                                        t.Cell().Padding(5).AlignRight().Text($"{extra.Amount:N2} TL");
                                    }
                                });
                            });

                            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten3);

                            col.Item().PaddingVertical(10).Row(row =>
                            {
                                row.RelativeItem();
                                row.RelativeItem().Column(total =>
                                {
                                    total.Item().Text($"Konaklama Tutarı: {invoice.AccommodationCost:N2} TL").FontSize(10);
                                    if (invoice.ExtrasCost > 0)
                                        total.Item().Text($"Ekstra Harcamalar: {invoice.ExtrasCost:N2} TL").FontSize(10);
                                    total.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                                    total.Item().PaddingTop(5).Text($"TOPLAM: {invoice.TotalAmount:N2} TL").Bold().FontSize(14).FontColor(Colors.Blue.Medium);
                                });
                            });

                            col.Item().PaddingTop(20).Text("Ödeme Durumu: ").Bold();
                            col.Item().Text(invoice.Status switch
                            {
                                InvoiceStatus.Paid => "ÖDENDİ",
                                InvoiceStatus.Cancelled => "İPTAL EDİLDİ",
                                _ => "BEKLİYOR"
                            }).Bold().FontColor(invoice.Status switch
                            {
                                InvoiceStatus.Paid => Colors.Green.Medium,
                                InvoiceStatus.Cancelled => Colors.Red.Medium,
                                _ => Colors.Orange.Medium
                            });
                        });
                    });

                    page.Footer().Element(footer =>
                    {
                        footer.AlignCenter().Text(x =>
                        {
                            x.Span("TKİ Misafirhane Otomasyonu | ").FontSize(8).FontColor(Colors.Grey.Medium);
                            x.Span($"Sayfa ").FontSize(8).FontColor(Colors.Grey.Medium);
                            x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                    });
                });
            });

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
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
