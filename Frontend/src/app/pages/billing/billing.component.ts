import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDto, InvoiceStatus } from '../../models/invoice.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DatePicker,
    Select,
    ButtonModule,
    Tag,
    Toast,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="billing-page">
      <div class="page-header">
        <h2>Fatura ve Muhasebe Geçmişi</h2>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <label>Tarih Aralığı</label>
          <p-datePicker
            [(ngModel)]="dateRange"
            selectionMode="range"
            [showIcon]="true"
            dateFormat="dd.mm.yy"
            placeholder="Tarih seçin"
            styleClass="date-filter"
          ></p-datePicker>
        </div>
        <div class="filter-item">
          <label>Misafir Tipi</label>
          <p-select
            [(ngModel)]="selectedGuestType"
            [options]="guestTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tümü"
            styleClass="type-filter"
          ></p-select>
        </div>
        <div class="filter-item">
          <label>Durum</label>
          <p-select
            [(ngModel)]="selectedStatus"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tümü"
            styleClass="status-filter"
          ></p-select>
        </div>
      </div>

      <p-table
        [value]="filteredInvoices"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{first} - {last} / {totalRecords} kayıt"
        styleClass="p-datatable-striped"
        [sortField]="'issueDate'"
        [sortOrder]="-1"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="guestName">Müşteri Adı <p-sortIcon field="guestName"></p-sortIcon></th>
            <th>Konaklama Bedeli</th>
            <th>Ekstra Harcamalar</th>
            <th pSortableColumn="totalAmount">Toplam Ödenen <p-sortIcon field="totalAmount"></p-sortIcon></th>
            <th pSortableColumn="issueDate">Fatura Tarihi <p-sortIcon field="issueDate"></p-sortIcon></th>
            <th>Durum</th>
            <th style="width: 100px; text-align: center">Aksiyon</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-inv>
          <tr>
            <td class="name-cell">{{ inv.guestName }}</td>
            <td>{{ inv.accommodationCost | currency: 'TRY': 'symbol': '1.2-2' }}</td>
            <td>{{ inv.extrasCost | currency: 'TRY': 'symbol': '1.2-2' }}</td>
            <td class="total-cell">{{ inv.totalAmount | currency: 'TRY': 'symbol': '1.2-2' }}</td>
            <td>{{ inv.issueDate | date: 'dd.MM.yyyy HH:mm' }}</td>
            <td>
              <p-tag
                [value]="getStatusLabel(inv.status)"
                [severity]="getStatusSeverity(inv.status)"
              ></p-tag>
            </td>
            <td style="text-align: center">
              <button
                pButton
                icon="pi pi-file-pdf"
                class="p-button-danger p-button-sm p-button-text"
                pTooltip="PDF İndir"
                (click)="downloadPdf(inv)"
              ></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="empty-message">Fatura bulunamadı.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: `
    .billing-page {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e3a5f;
    }

    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .filter-item label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
    }

    .name-cell {
      font-weight: 600;
    }

    .total-cell {
      font-weight: 700;
      color: #1e3a5f;
    }

    .empty-message {
      text-align: center;
      padding: 2rem !important;
      color: #9ca3af;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 0.2s;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: #f0f7ff !important;
    }
  `,
})
export class BillingComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);

  invoices: InvoiceDto[] = [];
  dateRange: Date[] = [];
  selectedGuestType: string = '';
  selectedStatus: string = '';

  guestTypeOptions = [
    { label: 'Sadece TKİ', value: 'tki' },
    { label: 'Sadece Sivil', value: 'civilian' },
  ];

  statusOptions = [
    { label: 'Bekliyor', value: InvoiceStatus.Pending },
    { label: 'Ödendi', value: InvoiceStatus.Paid },
    { label: 'İptal', value: InvoiceStatus.Cancelled },
  ];

  get filteredInvoices(): InvoiceDto[] {
    let result = [...this.invoices];

    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      const start = new Date(this.dateRange[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.dateRange[1]);
      end.setHours(23, 59, 59, 999);
      result = result.filter((inv) => {
        const d = new Date(inv.issueDate);
        return d >= start && d <= end;
      });
    }

    if (this.selectedGuestType) {
      result = result.filter((inv) => {
        if (this.selectedGuestType === 'tki') return inv.guestType === 0;
        if (this.selectedGuestType === 'civilian') return inv.guestType === 1;
        return true;
      });
    }

    if (this.selectedStatus !== '' && this.selectedStatus !== null && this.selectedStatus !== undefined) {
      result = result.filter((inv) => inv.status === Number(this.selectedStatus));
    }

    return result;
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.invoices = res.data;
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Fatura verileri yüklenirken hata oluştu.',
        });
      },
    });
  }

  getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.Pending: return 'Bekliyor';
      case InvoiceStatus.Paid: return 'Ödendi';
      case InvoiceStatus.Cancelled: return 'İptal';
      default: return 'Bilinmiyor';
    }
  }

  getStatusSeverity(status: InvoiceStatus): 'warn' | 'success' | 'danger' | 'info' | 'secondary' | 'contrast' {
    switch (status) {
      case InvoiceStatus.Pending: return 'warn';
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Cancelled: return 'danger';
      default: return 'info';
    }
  }

  downloadPdf(invoice: InvoiceDto): void {
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fatura-${invoice.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Fatura PDF indirildi.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'PDF indirilemedi.',
        });
      },
    });
  }
}
