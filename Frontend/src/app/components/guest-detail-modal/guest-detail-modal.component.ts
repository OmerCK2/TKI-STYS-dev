import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestDto, GuestType } from '../../models/guest.model';

@Component({
  selector: 'app-guest-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible && guest) {
      <div class="modal-overlay" (click)="close.emit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Misafir Detayları</h3>
            <button class="close-btn" (click)="close.emit()">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">TC Kimlik No</span>
              <span class="detail-value tc">{{ guest.nationalId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Adı Soyadı</span>
              <span class="detail-value bold">{{ guest.firstName }} {{ guest.lastName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Telefon</span>
              <span class="detail-value">{{ guest.phoneNumber || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Misafir Tipi</span>
              <span class="detail-value">
                <span class="type-badge" [class.tki]="guest.type === 0" [class.civil]="guest.type === 1">
                  {{ guest.type === 0 ? 'TKİ Personeli' : 'Sivil' }}
                </span>
              </span>
            </div>
            @if (guest.company) {
              <div class="detail-row">
                <span class="detail-label">Kurum</span>
                <span class="detail-value">{{ guest.company }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s;
    }

    .modal-content {
      background: #fff;
      border-radius: 14px;
      width: 420px;
      max-width: 95vw;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.25s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0A1628;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .detail-row:last-child { border-bottom: none; }

    .detail-label {
      font-size: 0.82rem;
      color: #6b7280;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.92rem;
      color: #1f2937;
      font-weight: 600;
    }

    .detail-value.tc {
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }

    .detail-value.bold {
      font-weight: 700;
      color: #0A1628;
    }

    .type-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .type-badge.tki {
      background: #EFF6FF;
      color: #1B3A5C;
    }

    .type-badge.civil {
      background: #FEF3C7;
      color: #92400E;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    :host-context(.dark) .modal-content { background: #1e293b; }
    :host-context(.dark) .modal-header { border-color: #334155; }
    :host-context(.dark) .modal-header h3 { color: #e2e8f0; }
    :host-context(.dark) .detail-label { color: #94a3b8; }
    :host-context(.dark) .detail-value { color: #e2e8f0; }
    :host-context(.dark) .detail-value.bold { color: #f1f5f9; }
    :host-context(.dark) .detail-row { border-color: #334155; }
  `,
})
export class GuestDetailModalComponent {
  @Input() visible = false;
  @Input() guest: GuestDto | null = null;
  @Output() close = new EventEmitter<void>();
}
