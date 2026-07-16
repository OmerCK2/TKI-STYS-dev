import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { TryFormatPipe } from '../../pipes/ttry.pipe';

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
    DatePipe,
    TryFormatPipe,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="billing-page">
      <div class="page-header">
        <div>
          <h2>Fatura ve Muhasebe Geçmişi</h2>
          <p class="page-desc">Oluşturulan faturaları görüntüleyin ve yönetin.</p>
        </div>
        <button class="export-btn" (click)="exportCsv()">
          <i class="pi pi-download"></i> CSV İndir
        </button>
      </div>

      <div class="filter-card">
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
      </div>

      <div class="table-card">
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
              <td>{{ inv.accommodationCost | tryFormat: 2 }}</td>
              <td>{{ inv.extrasCost | tryFormat: 2 }}</td>
              <td class="total-cell">{{ inv.totalAmount | tryFormat: 2 }}</td>
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
                <button
                  pButton
                  icon="pi pi-print"
                  class="p-button-sm p-button-text"
                  pTooltip="Yazdır"
                  (click)="printInvoice(inv)"
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
    </div>
  `,
  styles: `
    .billing-page {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
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

    .filter-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .filter-bar {
      display: flex;
      gap: 1rem;
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

    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .name-cell {
      font-weight: 600;
    }

    .total-cell {
      font-weight: 700;
      color: #1B3A5C;
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
      background-color: rgba(27, 58, 92, 0.04) !important;
    }

    .export-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #C41E3A, #a01830);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(196, 30, 58, 0.25);
    }

    .export-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(196, 30, 58, 0.35);
    }

    :host-context(.dark) .page-header h2 { color: #e2e8f0; }
    :host-context(.dark) .page-desc { color: #94a3b8; }
    :host-context(.dark) .table-card { background: #1e293b; }
    :host-context(.dark) .filter-card { background: #1e2730; }
    :host-context(.dark) .filter-item label { color: #94a3b8; }
    :host-context(.dark) .total-cell { color: #93c5fd; }
  `,
})
export class BillingComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

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
          this.cdr.detectChanges();
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

  exportCsv(): void {
    const headers = ['Müşteri Adı', 'Konaklama', 'Ekstra', 'Toplam', 'Tarih', 'Durum'];
    const rows = this.filteredInvoices.map(inv => [
      inv.guestName,
      inv.accommodationCost.toFixed(2),
      inv.extrasCost.toFixed(2),
      inv.totalAmount.toFixed(2),
      new Date(inv.issueDate).toLocaleDateString('tr-TR'),
      this.getStatusLabel(inv.status),
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `faturalar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  printInvoice(invoice: InvoiceDto): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Fatura - ${invoice.guestName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 3px solid #C41E3A; padding-bottom: 1rem; }
          .logo { font-size: 1.5rem; font-weight: 900; color: #0A1628; }
          .title { font-size: 1.2rem; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
          th { background: #0A1628; color: #fff; padding: 10px; text-align: left; font-size: 0.85rem; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 1.2rem; font-weight: 700; color: #C41E3A; text-align: right; margin-top: 1rem; }
          .footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">TKİ STYS</div>
            <div class="title">Sosyal Tesis Yönetim Sistemi</div>
          </div>
          <div style="text-align:right">
            <div><strong>Fatura No:</strong> ${invoice.id.slice(0, 8).toUpperCase()}</div>
            <div><strong>Tarih:</strong> ${new Date(invoice.issueDate).toLocaleDateString('tr-TR')}</div>
          </div>
        </div>
        <table>
          <tr><td><strong>Müşteri</strong></td><td>${invoice.guestName}</td></tr>
          <tr><td><strong>Konaklama Bedeli</strong></td><td>${invoice.accommodationCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</td></tr>
          <tr><td><strong>Ekstra Harcamalar</strong></td><td>${invoice.extrasCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</td></tr>
          <tr><td><strong>Durum</strong></td><td>${this.getStatusLabel(invoice.status)}</td></tr>
        </table>
        <div class="total">Toplam: ${invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
        <div class="footer">TKİ Sosyal Tesis Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}
