using FluentValidation;
using TkiMisafirhane.Core.DTOs;

namespace TkiMisafirhane.Business.Validators
{
    public class CreateRoomDtoValidator : AbstractValidator<CreateRoomDto>
    {
        public CreateRoomDtoValidator()
        {
            RuleFor(x => x.RoomNumber)
                .GreaterThan(0).WithMessage("Oda numarası 0'dan büyük olmalıdır");

            RuleFor(x => x.Floor)
                .InclusiveBetween(1, 10).WithMessage("Kat numarası 1 ile 10 arasında olmalıdır");

            RuleFor(x => x.Capacity)
                .InclusiveBetween(1, 6).WithMessage("Kapasite 1 ile 6 arasında olmalıdır");

            RuleFor(x => x.NightlyRateTki)
                .GreaterThan(0).WithMessage("TKİ gecelik ücreti 0'dan büyük olmalıdır");

            RuleFor(x => x.NightlyRateCivilian)
                .GreaterThan(0).WithMessage("Sivil gecelik ücreti 0'dan büyük olmalıdır");
        }
    }

    public class CreateGuestDtoValidator : AbstractValidator<CreateGuestDto>
    {
        public CreateGuestDtoValidator()
        {
            RuleFor(x => x.NationalId)
                .NotEmpty().WithMessage("TC Kimlik numarası gereklidir")
                .Length(11).WithMessage("TC Kimlik numarası 11 haneli olmalıdır")
                .Matches(@"^\d+$").WithMessage("TC Kimlik numarası sadece rakamlardan oluşmalıdır");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Ad gereklidir")
                .MaximumLength(50).WithMessage("Ad en fazla 50 karakter olabilir");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Soyad gereklidir")
                .MaximumLength(50).WithMessage("Soyad en fazla 50 karakter olabilir");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası gereklidir")
                .Matches(@"^5\d{9}$").WithMessage("Geçerli bir telefon numarası giriniz (5XX XXX XXXX)");
        }
    }

    public class CheckInDtoValidator : AbstractValidator<CheckInDto>
    {
        public CheckInDtoValidator()
        {
            RuleFor(x => x.RoomId)
                .NotEmpty().WithMessage("Oda seçimi gereklidir");

            RuleFor(x => x.NationalId)
                .NotEmpty().WithMessage("TC Kimlik numarası gereklidir")
                .Length(11).WithMessage("TC Kimlik numarası 11 haneli olmalıdır")
                .Matches(@"^\d+$").WithMessage("TC Kimlik numarası sadece rakamlardan oluşmalıdır");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Ad gereklidir");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Soyad gereklidir");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası gereklidir");

            RuleFor(x => x.CheckInDate)
                .NotEmpty().WithMessage("Giriş tarihi gereklidir");
        }
    }

    public class CheckOutDtoValidator : AbstractValidator<CheckOutDto>
    {
        public CheckOutDtoValidator()
        {
            RuleFor(x => x.ReservationId)
                .NotEmpty().WithMessage("Rezervasyon ID'si gereklidir");

            RuleFor(x => x.CheckOutDate)
                .NotEmpty().WithMessage("Çıkış tarihi gereklidir");
        }
    }

    public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
    {
        public ChangePasswordDtoValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Mevcut şifre gereklidir");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Yeni şifre gereklidir")
                .MinimumLength(6).WithMessage("Yeni şifre en az 6 karakter olmalıdır")
                .Matches(@"[A-Z]").WithMessage("Yeni şifre en az bir büyük harf içermelidir")
                .Matches(@"[a-z]").WithMessage("Yeni şifre en az bir küçük harf içermelidir")
                .Matches(@"[0-9]").WithMessage("Yeni şifre en az bir rakam içermelidir");

            RuleFor(x => x.ConfirmNewPassword)
                .Equal(x => x.NewPassword).WithMessage("Şifreler eşleşmiyor");
        }
    }

    public class AdminCreateUserDtoValidator : AbstractValidator<AdminCreateUserDto>
    {
        public AdminCreateUserDtoValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Kullanıcı adı gereklidir")
                .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır")
                .MaximumLength(20).WithMessage("Kullanıcı adı en fazla 20 karakter olabilir")
                .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta gereklidir")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Ad gereklidir");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Soyad gereklidir");
        }
    }

    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Kullanıcı adı gereklidir");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir");
        }
    }
}
