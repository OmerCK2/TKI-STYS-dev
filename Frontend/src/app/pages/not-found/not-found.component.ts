import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page">
      <div class="nf-content">
        <div class="nf-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h1>404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Baktığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.</p>
        <a routerLink="/dashboard" class="nf-btn">
          <i class="pi pi-home"></i>
          Kontrol Paneline Dön
        </a>
      </div>
    </div>
  `,
  styles: `
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 120px);
      text-align: center;
    }

    .nf-content {
      max-width: 400px;
    }

    .nf-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #FEF2F2;
      color: #C41E3A;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
    }

    h1 {
      font-size: 5rem;
      font-weight: 900;
      color: #C41E3A;
      margin: 0;
      line-height: 1;
      letter-spacing: -2px;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0A1628;
      margin: 0.5rem 0;
    }

    p {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0 0 2rem;
    }

    .nf-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #C41E3A, #8B0000);
      color: #fff;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: 0 4px 15px rgba(196, 30, 58, 0.3);
    }

    .nf-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(196, 30, 58, 0.4);
    }

    :host-context(.dark) h2 { color: #e2e8f0; }
    :host-context(.dark) p { color: #94a3b8; }
    :host-context(.dark) .nf-icon { background: rgba(196, 30, 58, 0.15); }
  `,
})
export class NotFoundComponent {}
