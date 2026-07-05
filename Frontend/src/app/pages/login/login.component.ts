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
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-area">
            <i class="pi pi-building login-icon"></i>
          </div>
          <h1 class="login-title">TKI Misafirhane</h1>
          <p class="login-subtitle">Sistem Girişi</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Kullanıcı Adı</label>
            <input
              pInputText
              id="username"
              formControlName="username"
              placeholder="Kullanıcı adınızı girin"
              [class.ng-invalid]="isFieldInvalid('username')"
              (keydown)="onUsernameKeydown($event)"
              #usernameInput
            />
            @if (isFieldInvalid('username')) {
              <small class="field-error">Bu alan zorunludur</small>
            }
          </div>

          <div class="field">
            <label for="password">Şifre</label>
            <input
              pInputText
              id="password"
              type="password"
              formControlName="password"
              placeholder="Şifrenizi girin"
              [class.ng-invalid]="isFieldInvalid('password')"
              #passwordInput
            />
            @if (isFieldInvalid('password')) {
              <small class="field-error">Bu alan zorunludur</small>
            }
          </div>

          @if (errorMessage) {
            <div class="login-error">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <button
            pButton
            type="submit"
            label="Giriş Yap"
            icon="pi pi-sign-in"
            [loading]="isLoading"
            [disabled]="loginForm.invalid || isLoading"
            class="login-btn"
          ></button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5aa0 50%, #1a237e 100%);
      padding: 1rem;
    }

    .login-card {
      background: #fff;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo-area {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.25rem;
      background: linear-gradient(135deg, #1e3a5f, #2c5aa0);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-icon {
      font-size: 2.25rem;
      color: #fff;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin: 0 0 0.25rem;
    }

    .login-subtitle {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0;
    }

    .field {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 0.95rem;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.35rem;
      display: block;
    }

    :host ::ng-deep input.ng-invalid.ng-touched {
      border-color: #dc2626 !important;
    }

    .login-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 0.875rem 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #dc2626;
      font-size: 0.9rem;
    }

    .login-btn {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #1e3a5f, #2c5aa0);
    }

    :host ::ng-deep .login-btn.p-button:disabled {
      opacity: 0.5;
      pointer-events: none;
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
          this.router.navigate(['/rooms']);
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
