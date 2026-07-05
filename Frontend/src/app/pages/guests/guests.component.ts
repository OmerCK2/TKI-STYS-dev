import { Component, inject, OnInit } from '@angular/core';
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
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="guests-page">
      <div class="page-header">
        <h2>Müşteri Listesi</h2>
        <span class="globalSearch">
          <i class="pi pi-search"></i>
          <input
            pInputText
            [(ngModel)]="globalFilter"
            placeholder="İsim veya TC ile ara..."
          />
        </span>
      </div>

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
          <tr>
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
  `,
  styles: `
    .guests-page {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e3a5f;
    }

    .globalSearch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fff;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 0.5rem 1rem;
    }

    .globalSearch i {
      color: #9ca3af;
    }

    .globalSearch input {
      border: none;
      outline: none;
      font-size: 0.9rem;
      width: 220px;
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
export class GuestsComponent implements OnInit {
  private guestService = inject(GuestService);
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);

  rows: GuestTableRow[] = [];
  globalFilter = '';

  get filteredRows(): GuestTableRow[] {
    if (!this.globalFilter) return this.rows;
    const filter = this.globalFilter.toLowerCase();
    return this.rows.filter(
      (r) =>
        r.guestName.toLowerCase().includes(filter) ||
        r.nationalId.includes(filter)
    );
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

          this.guestService.getAll().subscribe({
            next: (guestRes) => {
              if (guestRes.success && guestRes.data) {
                this.rows = this.rows.map((row) => {
                  const guest = guestRes.data.find((g) => g.firstName + ' ' + g.lastName === row.guestName);
                  return guest
                    ? { ...row, nationalId: guest.nationalId, phoneNumber: guest.phoneNumber }
                    : row;
                });
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
}
