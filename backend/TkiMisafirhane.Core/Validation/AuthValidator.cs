using System;
using TkiMisafirhane.Core.DTOs;
using TkiMisafirhane.Core.Exceptions;

namespace TkiMisafirhane.Core.Validation
{
    public class AuthValidator
    {
        public static void ValidateLogin(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                throw new BusinessException("Kullanıcı adı boş bırakılamaz!");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new BusinessException("Şifre alanı boş bırakılamaz!");
        }

        public static void ValidateRegister(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email))
                throw new BusinessException("Kullanıcı adı ve E-posta alanları boş geçilemez!");

            if (!dto.Email.Contains("@"))
                throw new BusinessException("Geçerli bir e-posta adresi giriniz!");

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
                throw new BusinessException("Şifre en az 6 karakterden oluşmalıdır!");
        }

        public static void ValidateChangePassword(ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                throw new BusinessException("Mevcut şifrenizi girmeniz gerekmektedir!");

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
                throw new BusinessException("Yeni şifre en az 6 karakter olmalıdır!");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new BusinessException("Girdiğiniz yeni şifreler birbiriyle uyuşmuyor!");
        }
    }
}