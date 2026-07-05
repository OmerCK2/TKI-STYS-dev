using System;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Exceptions;

namespace TkiMisafirhane.Core.Validation
{
    public class RoomValidator
    {
        public static void ValidateCreate(CreateRoomDto dto)
        {
            if (dto.RoomNumber <= 0)
                throw new BusinessException("Oda numarası 0 veya negatif olamaz!");

            if (dto.Capacity <= 0)
                throw new BusinessException("Oda kapasitesi en az 1 kişi olmalıdır!");

            if (dto.NightlyRateCivilian <= 0 || dto.NightlyRateTki <= 0)
                throw new BusinessException("Oda fiyatları 0 veya negatif olamaz!");
        }
    }
}