import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GuestService } from '../../services/guest.service';
import { ReservationService } from '../../services/reservation.service';
import { GuestDto } from '../../models/guest.model';
import { GuestDetailModalComponent } from '../../components/guest-detail-modal/guest-detail-modal.component';

interface GuestTableRow {
  nationalId: string;
  guestName: string;
  phoneNumber: string;
  roomNumber: number;
  checkInDate: string;
  checkOutDate?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputText,
    Tag,
    Toast,
    DatePipe,
    GuestDetailModalComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="guests-page">
      <div class="page-header">
        <div>
          <h2>Müşteri Listesi</h2>
          <p class="page-desc">Tüm misafirlerin kayıtlarını görüntüleyin.</p>
        </div>
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            pInputText
            [(ngModel)]="globalFilter"
            placeholder="İsim veya TC ile ara..."
          />
          <button class="export-btn" (click)="exportCsv()" title="CSV olarak indir">
            <i class="pi pi-download"></i>
          </button>
        </div>
      </div>

      <div class="table-card">
        <p-table
          [value]="filteredRows"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} - {last} / {totalRecords} kayıt"
          [globalFilterFields]="['guestName', 'nationalId']"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>TC Kimlik No</th>
              <th>Adı Soyadı</th>
              <th>Telefon</th>
              <th>Kaldığı Oda</th>
              <th>Giriş Tarihi</th>
              <th>Çıkış Tarihi</th>
              <th>Durum</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr class="clickable-row" (click)="onRowClick(row)">
              <td class="tc-cell">{{ row.nationalId }}</td>
              <td class="name-cell">{{ row.guestName }}</td>
              <td>{{ row.phoneNumber }}</td>
              <td class="room-cell">{{ row.roomNumber }}</td>
              <td>{{ row.checkInDate | date: 'dd.MM.yyyy HH:mm' }}</td>
              <td>{{ row.checkOutDate ? (row.checkOutDate | date: 'dd.MM.yyyy HH:mm') : '-' }}</td>
              <td>
                <p-tag
                  [value]="row.isActive ? 'İçeride' : 'Ayrıldı'"
                  [severity]="row.isActive ? 'success' : 'secondary'"
                ></p-tag>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">Kayıt bulunamadı.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <app-guest-detail-modal
      [visible]="showDetailModal"
      [guest]="selectedGuest"
      (close)="showDetailModal = false"
    ></app-guest-detail-modal>
  `,
  styles: `
    .guests-page {
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

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fff;
      border: 1.5px solid #d1d5db;
      border-radius: 10px;
      padding: 0.5rem 1rem;
      transition: all 0.2s;
    }

    .search-box:focus-within {
      border-color: #1B3A5C;
      box-shadow: 0 0 0 3px rgba(27, 58, 92, 0.12);
    }

    .search-box i {
      color: #9ca3af;
    }

    .search-box input {
      border: none;
      outline: none;
      font-size: 0.9rem;
      width: 220px;
      background: transparent;
    }

    .export-btn {
      background: none;
      border: none;
      color: #C41E3A;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .export-btn:hover {
      background: #FEF2F2;
      transform: scale(1.1);
    }

    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .tc-cell {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .name-cell {
      font-weight: 600;
    }

    .room-cell {
      font-weight: 700;
      color: #1B3A5C;
    }

    .empty-message {
      text-align: center;
      padding: 2rem !important;
      color: #9ca3af;
    }

    .clickable-row {
      cursor: pointer;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 0.2s;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: rgba(27, 58, 92, 0.04) !important;
    }

    :host-context(.dark) .page-header h2 { color: #e2e8f0; }
    :host-context(.dark) .page-desc { color: #94a3b8; }
    :host-context(.dark) .table-card { background: #1e293b; }
    :host-context(.dark) .search-box { background: #1e293b; border-color: #334155; }
    :host-context(.dark) .search-box input { color: #e2e8f0; }
    :host-context(.dark) .tc-cell { color: #94a3b8; }
  `,
})
export class GuestsComponent implements OnInit {
  private guestService = inject(GuestService);
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  rows: GuestTableRow[] = [];
  globalFilter = '';
  showDetailModal = false;
  selectedGuest: GuestDto | null = null;

  get filteredRows(): GuestTableRow[] {
    if (!this.globalFilter) return this.rows;
    const filter = this.globalFilter.toLowerCase();
    return this.rows.filter(
      (r) =>
        r.guestName.toLowerCase().includes(filter) ||
        r.nationalId.includes(filter)
    );
  }

  onRowClick(row: GuestTableRow): void {
    this.selectedGuest = {
      id: '',
      nationalId: row.nationalId,
      firstName: row.guestName.split(' ')[0],
      lastName: row.guestName.split(' ').slice(1).join(' '),
      phoneNumber: row.phoneNumber,
      type: 0,
    };
    this.showDetailModal = true;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reservationService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rows = res.data.map((r) => ({
            nationalId: '',
            guestName: r.guestName,
            phoneNumber: '',
            roomNumber: r.roomNumber,
            checkInDate: r.checkInDate,
            checkOutDate: r.checkOutDate,
            isActive: r.isActive,
              }));
              this.cdr.detectChanges();

              this.guestService.getAll().subscribe({
            next: (guestRes) => {
              if (guestRes.success && guestRes.data) {
                this.rows = this.rows.map((row) => {
                  const guest = guestRes.data.find((g) => g.firstName + ' ' + g.lastName === row.guestName);
                  return guest
                    ? { ...row, nationalId: guest.nationalId, phoneNumber: guest.phoneNumber }
                    : row;
                });
                this.cdr.detectChanges();
              }
            },
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Müşteri verileri yüklenirken hata oluştu.',
        });
      },
    });
  }

  exportCsv(): void {
    const headers = ['TC Kimlik', 'Adı Soyadı', 'Telefon', 'Oda No', 'Giriş Tarihi', 'Çıkış Tarihi', 'Durum'];
    const rows = this.filteredRows.map(r => [
      r.nationalId,
      r.guestName,
      r.phoneNumber,
      r.roomNumber,
      r.checkInDate ? new Date(r.checkInDate).toLocaleDateString('tr-TR') : '',
      r.checkOutDate ? new Date(r.checkOutDate).toLocaleDateString('tr-TR') : '',
      r.isActive ? 'İçeride' : 'Ayrıldı',
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `misafirler_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
