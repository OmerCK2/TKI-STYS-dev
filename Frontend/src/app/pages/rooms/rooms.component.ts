import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { RoomDto, RoomStatus } from '../../models/room.model';
import { ReservationDto } from '../../models/reservation.model';
import { CheckinModalComponent } from '../../components/checkin-modal/checkin-modal.component';
import { CheckoutModalComponent } from '../../components/checkout-modal/checkout-modal.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    Toast,
    CheckinModalComponent,
    CheckoutModalComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="rooms-page">
      <div class="page-header">
        <h2>Oda Durumu Krokisi</h2>
        <div class="legend">
          <span class="legend-item empty"><i class="pi pi-circle-fill"></i> Boş</span>
          <span class="legend-item occupied"><i class="pi pi-circle-fill"></i> Dolu</span>
          <span class="legend-item reserved"><i class="pi pi-circle-fill"></i> Rezerve</span>
          <span class="legend-item maintenance"><i class="pi pi-circle-fill"></i> Bakım</span>
        </div>
      </div>

      <div class="rooms-grid">
        @for (room of rooms; track room.id) {
          <div
            class="room-card"
            [class.empty]="room.status === RoomStatus.Empty"
            [class.occupied]="room.status === RoomStatus.Occupied"
            [class.reserved]="room.status === RoomStatus.Reserved"
            [class.maintenance]="room.status === RoomStatus.Maintenance"
            (click)="onRoomClick(room)"
          >
            <div class="room-number">{{ room.roomNumber }}</div>
            <div class="room-status">
              {{ getStatusLabel(room.status) }}
            </div>
            <div class="room-floor">Kat {{ room.floor }}</div>
          </div>
        }
      </div>
    </div>

    <app-checkin-modal
      [(visible)]="showCheckinModal"
      [room]="selectedRoom"
      (checkinSuccess)="loadRooms()"
    ></app-checkin-modal>

    <app-checkout-modal
      [(visible)]="showCheckoutModal"
      [reservation]="selectedReservation"
      (checkoutSuccess)="loadRooms()"
    ></app-checkout-modal>
  `,
  styles: `
    .rooms-page {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e3a5f;
    }

    .legend {
      display: flex;
      gap: 1.25rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #6b7280;
    }

    .legend-item.empty i { color: #10b981; }
    .legend-item.occupied i { color: #ef4444; }
    .legend-item.reserved i { color: #f59e0b; }
    .legend-item.maintenance i { color: #6b7280; }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }

    .room-card {
      border-radius: 14px;
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .room-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .room-card.empty {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-color: #10b981;
      color: #065f46;
    }

    .room-card.occupied {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-color: #ef4444;
      color: #991b1b;
    }

    .room-card.reserved {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-color: #f59e0b;
      color: #92400e;
    }

    .room-card.maintenance {
      background: linear-gradient(135deg, #e5e7eb, #d1d5db);
      border-color: #6b7280;
      color: #374151;
    }

    .room-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .room-status {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .room-floor {
      font-size: 0.75rem;
      opacity: 0.8;
    }
  `,
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);

  rooms: RoomDto[] = [];
  activeReservations: ReservationDto[] = [];
  showCheckinModal = false;
  showCheckoutModal = false;
  selectedRoom: RoomDto | null = null;
  selectedReservation: ReservationDto | null = null;
  RoomStatus = RoomStatus;

  ngOnInit(): void {
    this.loadRooms();
    this.loadActiveReservations();
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data.sort((a, b) => a.roomNumber - b.roomNumber);
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Oda bilgileri yüklenirken hata oluştu.',
        });
      },
    });
    this.loadActiveReservations();
  }

  loadActiveReservations(): void {
    this.reservationService.getActive().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeReservations = res.data;
        }
      },
    });
  }

  onRoomClick(room: RoomDto): void {
    if (room.status === RoomStatus.Empty) {
      this.selectedRoom = room;
      this.showCheckinModal = true;
    } else if (room.status === RoomStatus.Occupied) {
      const reservation = this.activeReservations.find((r) => r.roomId === room.id);
      if (reservation) {
        this.selectedReservation = reservation;
        this.showCheckoutModal = true;
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Uyarı',
          detail: 'Bu oda için aktif rezervasyon bulunamadı.',
        });
      }
    }
  }

  getStatusLabel(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.Empty: return 'Boş';
      case RoomStatus.Occupied: return 'Dolu';
      case RoomStatus.Reserved: return 'Rezerve';
      case RoomStatus.Maintenance: return 'Bakım';
      default: return 'Bilinmiyor';
    }
  }
}
