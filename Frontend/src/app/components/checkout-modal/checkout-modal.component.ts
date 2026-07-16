import { Component, EventEmitter, Input, Output, inject, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ReservationDto, ExtraChargeDto } from '../../models/reservation.model';
import { InvoiceDto } from '../../models/invoice.model';
import { ReservationService } from '../../services/reservation.service';
import { InvoiceService } from '../../services/invoice.service';
import { TryFormatPipe } from '../../pipes/ttry.pipe';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    InputNumber,
    ButtonModule,
    Dialog,
    TableModule,
    DatePipe,
    TryFormatPipe,
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      [visible]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      header="Check-out ve Adisyon"
      [style]="{ width: '680px', maxHeight: '90vh' }"
      [closable]="true"
      (onHide)="onClose()"
    >
      @if (reservation) {
        <div class="checkout-content">
          <div class="info-section">
            <h3 class="section-title">
              <i class="pi pi-user"></i> Misafir Bilgileri
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Ad Soyad</span>
                <span class="info-value">{{ reservation.guestName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Oda No</span>
                <span class="info-value">{{ reservation.roomNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Giriş Tarihi</span>
                <span class="info-value">{{ reservation.checkInDate | date: 'dd.MM.yyyy HH:mm' }}</span>
              </div>
            </div>
          </div>

          <div class="cost-section">
            <div class="cost-row main-cost">
              <span>Konaklama Tutarı</span>
              <span class="cost-value">{{ accommodationCost | tryFormat: 2 }}</span>
            </div>
          </div>

          <div class="extras-section">
            <h3 class="section-title">
              <i class="pi pi-plus-circle"></i> Ekstra Harcamalar
            </h3>

            <div class="extra-form">
              <div class="extra-fields">
                <div class="field">
                  <input
                    pInputText
                    [(ngModel)]="newExtraDescription"
                    placeholder="Harcama açıklaması (ör: Minibar)"
                  />
                </div>
                <div class="field">
                  <p-inputNumber
                    [(ngModel)]="newExtraAmount"
                    [min]="0.01"
                    mode="decimal"
                    [minFractionDigits]="2"
                    placeholder="Tutar"
                    styleClass="w-full"
                  ></p-inputNumber>
                </div>
                <button
                  pButton
                  icon="pi pi-plus"
                  class="p-button-success p-button-sm"
                  [disabled]="!newExtraDescription || newExtraAmount <= 0"
                  (click)="addExtra()"
                ></button>
              </div>
            </div>

            @if (extras.length > 0) {
              <div class="extras-list">
                <p-table [value]="extras" styleClass="extras-table">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Açıklama</th>
                      <th style="width: 120px; text-align: right">Tutar</th>
                      <th style="width: 50px"></th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-extra>
                    <tr>
                      <td>{{ extra.description }}</td>
                      <td style="text-align: right">{{ extra.amount | tryFormat: 2 }}</td>
                      <td style="text-align: center">
                        <button
                          pButton
                          icon="pi pi-trash"
                          class="p-button-danger p-button-text p-button-sm"
                          (click)="removeExtra(extra)"
                        ></button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            }

            <div class="cost-row total-cost">
              <span>Genel Toplam</span>
              <span class="cost-value">{{ totalAmount | tryFormat: 2 }}</span>
            </div>
          </div>

          <div class="actions">
            <button
              pButton
              type="button"
              label="İptal"
              icon="pi pi-times"
              class="p-button-secondary"
              (click)="onClose()"
            ></button>
            <button
              pButton
              type="button"
              label="Ödemeyi Al ve Çıkış Yap"
              icon="pi pi-check"
              [loading]="isCheckingOut"
              [disabled]="isCheckingOut"
              class="checkout-btn"
              (click)="onCheckout()"
            ></button>
          </div>
        </div>
      }
    </p-dialog>
  `,
  styles: `
    .checkout-content {
      padding: 0.5rem 0;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1B3A5C;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.78rem;
      color: #6b7280;
      font-weight: 500;
    }

    .info-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #1f2937;
    }

    .cost-section {
      margin-bottom: 1.25rem;
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 0;
      font-weight: 500;
      color: #374151;
    }

    .main-cost {
      border-bottom: 1px solid #e9ecef;
    }

    .total-cost {
      border-top: 2px solid #1B3A5C;
      margin-top: 0.75rem;
      padding-top: 1rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1B3A5C;
    }

    .cost-value {
      font-weight: 700;
      color: #1B3A5C;
    }

    .extras-section {
      margin-bottom: 1.25rem;
    }

    .extra-form {
      margin-bottom: 1rem;
    }

    .extra-fields {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .extra-fields .field {
      flex: 1;
    }

    .extra-fields .field:last-child {
      flex: 0.7;
    }

    :host ::ng-deep .extras-table .p-datatable-thead {
      display: none;
    }

    .extras-list {
      margin-bottom: 0.75rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e9ecef;
    }

    :host ::ng-deep .checkout-btn {
      background: linear-gradient(135deg, #C41E3A, #8B0000) !important;
      border: none !important;
    }
  `,
})
export class CheckoutModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() reservation: ReservationDto | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() checkoutSuccess = new EventEmitter<void>();

  private reservationService = inject(ReservationService);
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);

  extras: ExtraChargeDto[] = [];
  newExtraDescription = '';
  newExtraAmount = 0;
  accommodationCost = 0;
  invoice: InvoiceDto | null = null;
  isCheckingOut = false;

  get totalAmount(): number {
    const extrasTotal = this.extras.reduce((sum, e) => sum + e.amount, 0);
    return this.accommodationCost + extrasTotal;
  }

  ngOnChanges(): void {
    if (this.visible && this.reservation) {
      this.extras = [];
      this.newExtraDescription = '';
      this.newExtraAmount = 0;
      this.invoice = null;
      this.loadInvoice();
    }
  }

  private loadInvoice(): void {
    if (!this.reservation) return;

    this.invoiceService.getByReservationId(this.reservation.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.invoice = res.data;
          this.accommodationCost = res.data.accommodationCost;
          this.extras = res.data.extras ? [...res.data.extras] : [];
        }
      },
      error: () => {
        this.accommodationCost = 0;
      },
    });
  }

  addExtra(): void {
    if (!this.newExtraDescription || this.newExtraAmount <= 0) return;

    this.extras.push({
      description: this.newExtraDescription,
      amount: this.newExtraAmount,
    });

    this.newExtraDescription = '';
    this.newExtraAmount = 0;
  }

  removeExtra(extra: ExtraChargeDto): void {
    this.extras = this.extras.filter((e) => e !== extra);
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCheckout(): void {
    if (!this.reservation) return;

    this.isCheckingOut = true;

    const dto = {
      reservationId: this.reservation.id,
      checkOutDate: new Date().toISOString(),
      extras: this.extras,
    };

    this.reservationService.checkOut(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: 'Check-out işlemi başarıyla tamamlandı.',
          });

          if (this.invoice) {
            this.invoiceService.downloadPdf(this.invoice.id).subscribe({
              next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fatura-${this.invoice!.id}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.isCheckingOut = false;
                this.checkoutSuccess.emit();
                this.onClose();
              },
              error: () => {
                this.isCheckingOut = false;
                this.checkoutSuccess.emit();
                this.onClose();
              },
            });
          } else {
            this.isCheckingOut = false;
            this.checkoutSuccess.emit();
            this.onClose();
          }
        } else {
          this.isCheckingOut = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: res.message || 'Check-out işlemi başarısız oldu.',
          });
        }
      },
      error: (err) => {
        this.isCheckingOut = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: err.error?.message || 'Sunucu hatası oluştu.',
        });
      },
    });
  }
}
