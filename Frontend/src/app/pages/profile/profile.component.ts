import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h2>Profilim</h2>
        <p class="page-desc">Hesap bilgilerinizi görüntüleyin.</p>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">{{ getInitials() }}</div>
        <h3 class="profile-name">{{ getDisplayName() }}</h3>
        <p class="profile-role">{{ auth.isAdmin() ? 'Sistem Yöneticisi' : 'Personel' }}</p>

        <div class="profile-fields">
          <div class="profile-field">
            <span class="profile-field-label">Kullanıcı Adı</span>
            <span class="profile-field-value">{{ auth.currentUser()?.username || '-' }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field-label">E-posta</span>
            <span class="profile-field-value">{{ auth.currentUser()?.email || '-' }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field-label">Ad</span>
            <span class="profile-field-value">{{ auth.currentUser()?.firstName || '-' }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field-label">Soyad</span>
            <span class="profile-field-value">{{ auth.currentUser()?.lastName || '-' }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field-label">Rol</span>
            <span class="profile-field-value role-badge" [class.admin]="auth.isAdmin()">
              {{ auth.isAdmin() ? 'Yönetici' : 'Personel' }}
            </span>
          </div>
        </div>

        <div class="profile-actions">
          <a routerLink="/change-password" class="change-pw-btn">
            <i class="pi pi-key"></i>
            Şifre Değiştir
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .profile-page {
      padding: 0;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0A1628;
    }

    .page-desc {
      font-size: 0.88rem;
      color: #6b7280;
      margin: 0.25rem 0 0;
    }

    .profile-actions {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f3f4f6;
    }

    :host-context(.dark) .profile-actions {
      border-color: #334155;
    }

    .change-pw-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #1B3A5C, #0D1F33);
      color: #fff;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: 0 4px 12px rgba(27, 58, 92, 0.25);
    }

    .change-pw-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(27, 58, 92, 0.35);
    }

    .role-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.82rem;
      background: #f3f4f6;
      color: #374151;
    }

    .role-badge.admin {
      background: #EFF6FF;
      color: #1B3A5C;
    }

    :host-context(.dark) .role-badge {
      background: #334155;
      color: #e2e8f0;
    }

    :host-context(.dark) .role-badge.admin {
      background: rgba(27, 58, 92, 0.3);
      color: #93c5fd;
    }

    :host-context(.dark) .page-header h2 { color: #e2e8f0; }
    :host-context(.dark) .page-desc { color: #94a3b8; }
  `,
})
export class ProfileComponent {
  auth = inject(AuthService);

  getInitials(): string {
    const user = this.auth.currentUser();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'TK';
  }

  getDisplayName(): string {
    const user = this.auth.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Kullanıcı';
  }
}
