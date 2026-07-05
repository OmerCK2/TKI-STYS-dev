using System;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Exceptions;

namespace TkiMisafirhane.Core.Validation
{
    public class ReservationValidator
    {
        public static void ValidateCheckIn(CheckInDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoomId))
                throw new BusinessException("Rezervasyon yapılacak oda seçilmelidir!");

            if (string.IsNullOrWhiteSpace(dto.NationalId) || dto.NationalId.Length != 11)
                throw new BusinessException("Giriş yapan misafirin TC Kimlik numarası tam 11 haneli olmalıdır!");

            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
                throw new BusinessException("Misafir adı ve soyadı alanları boş bırakılamaz!");
        }

        public static void ValidateCheckOut(CheckOutDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ReservationId))
                throw new BusinessException("Çıkış işlemi için geçerli bir rezervasyon ID'si gereklidir!");
        }
    }
}