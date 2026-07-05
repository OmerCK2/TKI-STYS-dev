import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {ButtonModule} from 'primeng/button';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  template: `
    @if (auth.isAuthenticated()) {
      <nav class="top-nav">
        <div class="nav-brand">
          <i class="pi pi-building"></i>
          <span>TKI Misafirhane</span>
        </div>
        <div class="nav-links">
          <a routerLink="/rooms" routerLinkActive="active">
            <i class="pi pi-home"></i> Odalar
          </a>
          <a routerLink="/guests" routerLinkActive="active">
            <i class="pi pi-users"></i> Müşteriler
          </a>
          <a routerLink="/billing" routerLinkActive="active">
            <i class="pi pi-wallet"></i> Faturalar
          </a>
        </div>
        <div class="nav-user">
          <span class="user-name">{{ auth.currentUser()?.username }}</span>
          <button pButton icon="pi pi-sign-out" class="p-button-text p-button-sm" (click)="onLogout()"></button>
        </div>
      </nav>
    }

    <main [class.has-nav]="auth.isAuthenticated()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #1e3a5f, #2c5aa0);
      padding: 0 1.5rem;
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .nav-brand i {
      font-size: 1.4rem;
    }

    .nav-links {
      display: flex;
      gap: 0.25rem;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: rgba(255, 255, 255, 0.75);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-links a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
    }

    .nav-links a.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.18);
      font-weight: 600;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-name {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
      font-weight: 500;
    }

    main {
      min-height: 100vh;
    }

    main.has-nav {
      min-height: calc(100vh - 60px);
    }
  `,
})
export class App {
  auth = inject(AuthService);

  onLogout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
