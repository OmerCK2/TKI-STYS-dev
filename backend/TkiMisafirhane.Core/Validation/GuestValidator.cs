using System;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Exceptions;

namespace TkiMisafirhane.Core.Validation
{
    public class GuestValidator
    {
        public static void Validate(GuestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NationalId) || dto.NationalId.Length != 11)
            {
                throw new BusinessException("TC Kimlik numarası alanı boş bırakılamaz ve tam 11 haneli olmalıdır!");
            }

            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            {
                throw new BusinessException("Misafir adı ve soyadı alanları boş geçilemez!");
            }
        }
    }
}