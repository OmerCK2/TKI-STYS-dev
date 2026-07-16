import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText, ButtonModule],
  template: `
    <div class="login-page">
      <div class="login-bg-pattern"></div>

      <div class="login-container">
        <div class="login-left">
          <div class="brand-section">
            <div class="brand-logo">
              <div class="logo-circle">
                <img src="assets/logo.svg" alt="TKİ" class="login-logo-img" />
              </div>
            </div>
            <h1 class="brand-title">TÜRKİ KÖMÜR İŞLETMELERİ</h1>
            <h2 class="brand-subtitle">Sosyal Tesis Yönetim Sistemi</h2>
            <div class="brand-divider"></div>
            <p class="brand-desc">
              Misafirhane yönetim sistemi ile tesislerinizi verimli bir şekilde yönetin.
            </p>
            <div class="feature-list">
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Oda Durumu Takibi</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Misafir Kayıt Yönetimi</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Faturalandırma</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Gerçek Zamanlı Kroki</span>
              </div>
            </div>
          </div>
        </div>

        <div class="login-right">
          <div class="login-card">
            <div class="card-header">
              <h3>Sisteme Giriş</h3>
              <p>Kullanıcı bilgilerinizi girerek devam edin</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="field">
                <label for="username">Kullanıcı Adı</label>
                <div class="input-wrapper">
                  <i class="pi pi-user"></i>
                  <input
                    pInputText
                    id="username"
                    formControlName="username"
                    placeholder="Kullanıcı adınız"
                    [class.ng-invalid]="isFieldInvalid('username')"
                    (keydown)="onUsernameKeydown($event)"
                    #usernameInput
                  />
                </div>
                @if (isFieldInvalid('username')) {
                  <small class="field-error">Bu alan zorunludur</small>
                }
              </div>

              <div class="field">
                <label for="password">Şifre</label>
                <div class="input-wrapper">
                  <i class="pi pi-lock"></i>
                  <input
                    pInputText
                    id="password"
                    type="password"
                    formControlName="password"
                    placeholder="Şifreniz"
                    [class.ng-invalid]="isFieldInvalid('password')"
                    #passwordInput
                  />
                </div>
                @if (isFieldInvalid('password')) {
                  <small class="field-error">Bu alan zorunludur</small>
                }
              </div>

              @if (errorMessage) {
                <div class="login-error">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>{{ errorMessage }}</span>
                </div>
              }

              <button
                pButton
                type="submit"
                label="Giriş Yap"
                icon="pi pi-arrow-right"
                [loading]="isLoading"
                [disabled]="loginForm.invalid || isLoading"
                class="login-btn"
              ></button>
            </form>

            <div class="card-footer">
              <p>Sadece yetkili personel giriş yapabilir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0A1628 0%, #0D1F33 40%, #1B3A5C 100%);
      position: relative;
      overflow: hidden;
    }

    .login-bg-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 50%, rgba(196, 30, 58, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(27, 58, 92, 0.15) 0%, transparent 50%);
    }

    .login-container {
      display: flex;
      width: 100%;
      max-width: 960px;
      min-height: 580px;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
      position: relative;
      z-index: 1;
    }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #0A1628, #1B3A5C);
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .login-left::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(196, 30, 58, 0.12) 0%, transparent 70%);
    }

    .brand-section {
      position: relative;
      z-index: 1;
    }

    .brand-logo {
      margin-bottom: 1.5rem;
    }

    .logo-circle {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(196, 30, 58, 0.3);
    }

    .login-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    }

    .brand-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1px;
      margin: 0 0 0.25rem;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      margin: 0 0 1.25rem;
    }

    .brand-divider {
      width: 50px;
      height: 3px;
      background: #C41E3A;
      border-radius: 2px;
      margin-bottom: 1.25rem;
    }

    .brand-desc {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
    }

    .feature-item i {
      color: #C41E3A;
      font-size: 0.9rem;
    }

    .login-right {
      flex: 1;
      padding: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      width: 100%;
      max-width: 360px;
    }

    .card-header {
      margin-bottom: 2rem;
    }

    .card-header h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0A1628;
      margin: 0 0 0.35rem;
    }

    .card-header p {
      font-size: 0.88rem;
      color: #6b7280;
      margin: 0;
    }

    .field {
      margin-bottom: 1.25rem;
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
      transition: all 0.2s;
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

    .login-error {
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

    .login-error i {
      color: #C41E3A;
      font-size: 1rem;
    }

    :host ::ng-deep .login-btn {
      width: 100%;
      padding: 0.8rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #C41E3A, #8B0000) !important;
      color: #fff !important;
      transition: all 0.3s !important;
      box-shadow: 0 4px 15px rgba(196, 30, 58, 0.3) !important;
    }

    :host ::ng-deep .login-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4) !important;
    }

    :host ::ng-deep .login-btn.p-button:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .card-footer {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.25rem;
      border-top: 1px solid #e9ecef;
    }

    .card-footer p {
      font-size: 0.8rem;
      color: #9ca3af;
      margin: 0;
    }

    @media (max-width: 768px) {
      .login-container {
        flex-direction: column;
        max-width: 420px;
        min-height: auto;
        margin: 1rem;
      }
      .login-left {
        padding: 2rem;
      }
      .login-right {
        padding: 2rem;
      }
      .feature-list {
        display: none;
      }
    }

    :host-context(.dark) .login-container {
      background: #1e293b;
    }

    :host-context(.dark) .form-section h2,
    :host-context(.dark) .form-section .subtitle {
      color: #e2e8f0;
    }

    :host-context(.dark) .logo-icon {
      background: rgba(196, 30, 58, 0.15);
    }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/rooms']);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onUsernameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('password')?.focus();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          if (res.data?.requiresPasswordChange) {
            this.router.navigate(['/change-password']);
          } else {
            this.router.navigate(['/rooms']);
          }
        } else {
          this.errorMessage = res.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      },
    });
  }
}
