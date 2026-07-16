import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText, ButtonModule, Toast],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="change-password-page">
      <div class="change-password-card">
        <div class="card-icon">
          <i class="pi pi-key"></i>
        </div>
        <h2>Zorunlu Şifre Değişikliği</h2>
        <p class="card-desc">
          Güvenliğiniz için ilk girişinizde şifrenizi değiştirmeniz gerekmektedir.
          Yeni şifreniz en az 6 karakter olmalıdır.
        </p>

        <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="currentPassword">Mevcut Şifre</label>
            <div class="input-wrapper">
              <i class="pi pi-lock"></i>
              <input
                pInputText
                id="currentPassword"
                type="password"
                formControlName="currentPassword"
                placeholder="Mevcut şifrenizi girin"
                [class.ng-invalid]="isFieldInvalid('currentPassword')"
              />
            </div>
            @if (isFieldInvalid('currentPassword')) {
              <small class="field-error">Bu alan zorunludur</small>
            }
          </div>

          <div class="field">
            <label for="newPassword">Yeni Şifre</label>
            <div class="input-wrapper">
              <i class="pi pi-lock"></i>
              <input
                pInputText
                id="newPassword"
                type="password"
                formControlName="newPassword"
                placeholder="Yeni şifrenizi girin"
                [class.ng-invalid]="isFieldInvalid('newPassword')"
              />
            </div>
            @if (isFieldInvalid('newPassword')) {
              <small class="field-error">
                @if (passwordForm.get('newPassword')?.errors?.['required']) {
                  Bu alan zorunludur
                } @else if (passwordForm.get('newPassword')?.errors?.['minlength']) {
                  Şifre en az 6 karakter olmalıdır
                }
              </small>
            }
          </div>

          <div class="field">
            <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
            <div class="input-wrapper">
              <i class="pi pi-lock"></i>
              <input
                pInputText
                id="confirmNewPassword"
                type="password"
                formControlName="confirmNewPassword"
                placeholder="Yeni şifrenizi tekrar girin"
                [class.ng-invalid]="isFieldInvalid('confirmNewPassword')"
              />
            </div>
            @if (isFieldInvalid('confirmNewPassword')) {
              <small class="field-error">
                @if (passwordForm.get('confirmNewPassword')?.errors?.['required']) {
                  Bu alan zorunludur
                } @else if (passwordForm.get('confirmNewPassword')?.errors?.['passwordMismatch']) {
                  Şifreler eşleşmiyor
                }
              </small>
            }
          </div>

          @if (errorMessage) {
            <div class="error-box">
              <i class="pi pi-exclamation-triangle"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <button
            pButton
            type="submit"
            label="Şifremi Değiştir"
            icon="pi pi-check"
            [loading]="isLoading"
            [disabled]="passwordForm.invalid || isLoading"
            class="submit-btn"
          ></button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .change-password-page {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f0f2f5;
    }

    .change-password-card {
      background: #fff;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .card-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #C41E3A, #8B0000);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .card-icon i {
      font-size: 2rem;
      color: #fff;
    }

    h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0A1628;
      margin: 0 0 0.5rem;
    }

    .card-desc {
      font-size: 0.88rem;
      color: #6b7280;
      margin: 0 0 2rem;
      line-height: 1.5;
    }

    .field {
      margin-bottom: 1.25rem;
      text-align: left;
    }

    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.85rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 0.9rem;
      z-index: 1;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 2.5rem;
      border-radius: 10px;
      font-size: 0.9rem;
      border: 1.5px solid #d1d5db;
    }

    .input-wrapper input:focus {
      border-color: #1B3A5C;
      box-shadow: 0 0 0 3px rgba(27, 58, 92, 0.12);
    }

    .field-error {
      color: #C41E3A;
      font-size: 0.78rem;
      margin-top: 0.3rem;
      display: block;
    }

    :host ::ng-deep input.ng-invalid.ng-touched {
      border-color: #C41E3A !important;
    }

    .error-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #C41E3A;
      font-size: 0.85rem;
    }

    :host ::ng-deep .submit-btn {
      width: 100%;
      padding: 0.8rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #C41E3A, #8B0000) !important;
      color: #fff !important;
      box-shadow: 0 4px 15px rgba(196, 30, 58, 0.3) !important;
    }

    :host ::ng-deep .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4) !important;
    }
  `,
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmNewPassword } = this.passwordForm.value;
    if (newPassword !== confirmNewPassword) {
      this.errorMessage = 'Yeni şifreler eşleşmiyor.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: 'Şifreniz başarıyla değiştirildi.',
          });
          setTimeout(() => {
            this.router.navigate(['/rooms']);
          }, 1500);
        } else {
          this.errorMessage = res.message || 'Şifre değiştirme başarısız.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Sunucu hatası oluştu.';
      },
    });
  }
}
