using System;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Exceptions;

namespace TkiMisafirhane.Core.Validation
{
    public class InvoiceValidator
    {
        public static void ValidateExtraCharge(CreateExtraChargeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Description))
                throw new BusinessException("Ekstra harcama açıklaması boş bırakılamaz!");

            if (dto.Amount < 0)
                throw new BusinessException("Ekstra harcama tutarı negatif olamaz!");
        }
    }
}