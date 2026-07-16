import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { SignalrService } from '../../services/signalr.service';
import { RoomDto, RoomStatus } from '../../models/room.model';
import { ReservationDto } from '../../models/reservation.model';
import { CheckinModalComponent } from '../../components/checkin-modal/checkin-modal.component';
import { CheckoutModalComponent } from '../../components/checkout-modal/checkout-modal.component';
import { TryFormatPipe } from '../../pipes/ttry.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    Toast,
    CheckinModalComponent,
    CheckoutModalComponent,
    TryFormatPipe,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="rooms-page">
      <div class="page-header">
        <div>
          <h2>Oda Durumu Krokisi</h2>
          <p class="page-desc">Tüm odaların anlık durumunu görüntüleyin. Tıklayarak check-in veya check-out yapın.</p>
        </div>
        <div class="header-right">
          <div class="view-toggle">
            <button class="toggle-btn" [class.active]="viewMode === 'floorplan'" (click)="viewMode = 'floorplan'">
              <i class="pi pi-directions"></i> <span class="toggle-label">Kat Planı</span>
            </button>
            <button class="toggle-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
              <i class="pi pi-th-large"></i> <span class="toggle-label">Grid</span>
            </button>
            <button class="toggle-btn" [class.active]="viewMode === 'calendar'" (click)="viewMode = 'calendar'; buildCalendar()">
              <i class="pi pi-calendar"></i> <span class="toggle-label">Takvim</span>
            </button>
          </div>
          <div class="stats-bar">
            <div class="stat-pill empty-pill"><span class="pill-num">{{ getRoomCountByStatus(RoomStatus.Empty) }}</span><span class="pill-lbl">Boş</span></div>
            <div class="stat-pill occupied-pill"><span class="pill-num">{{ getRoomCountByStatus(RoomStatus.Occupied) }}</span><span class="pill-lbl">Dolu</span></div>
            <div class="stat-pill reserved-pill"><span class="pill-num">{{ getRoomCountByStatus(RoomStatus.Reserved) }}</span><span class="pill-lbl">Rezerve</span></div>
            <div class="stat-pill maintenance-pill"><span class="pill-num">{{ getRoomCountByStatus(RoomStatus.Maintenance) }}</span><span class="pill-lbl">Bakım</span></div>
          </div>
        </div>
      </div>

      <div class="legend">
        <span class="legend-item"><span class="legend-dot empty-dot"></span> Boş</span>
        <span class="legend-item"><span class="legend-dot occupied-dot"></span> Dolu</span>
        <span class="legend-item"><span class="legend-dot reserved-dot"></span> Rezerve</span>
        <span class="legend-item"><span class="legend-dot maintenance-dot"></span> Bakım</span>
      </div>

      @if (viewMode === 'floorplan') {
        <div class="floorplan-view">
          @for (floor of getFloors(); track floor) {
            <div class="floor-plan-section">
              <div class="floor-plan-header">
                <i class="pi pi-building"></i>
                <span>Kat {{ floor }}</span>
                <span class="floor-plan-count">{{ getFloorRooms(floor).length }} oda</span>
              </div>
              <div class="building-layout">
                <div class="room-row top-rooms">
                  @for (room of getFloorRooms(floor).filter((_, i) => i < Math.ceil(getFloorRooms(floor).length / 2)); track room.id) {
                    <div class="fp-room"
                      [class.empty]="room.status === RoomStatus.Empty"
                      [class.occupied]="room.status === RoomStatus.Occupied"
                      [class.reserved]="room.status === RoomStatus.Reserved"
                      [class.maintenance]="room.status === RoomStatus.Maintenance"
                      (click)="onRoomClick(room)"
                      [title]="'Oda ' + room.roomNumber + ' - ' + getStatusLabel(room.status)"
                    >
                      <span class="fp-room-num">{{ room.roomNumber }}</span>
                      <span class="fp-room-status">{{ getStatusLabel(room.status) }}</span>
                    </div>
                  }
                </div>
                <div class="corridor">
                  <div class="corridor-line"></div>
                  <span class="corridor-label">KORİDOR</span>
                  <div class="corridor-line"></div>
                </div>
                <div class="room-row bottom-rooms">
                  @for (room of getFloorRooms(floor).filter((_, i) => i >= Math.ceil(getFloorRooms(floor).length / 2)); track room.id) {
                    <div class="fp-room"
                      [class.empty]="room.status === RoomStatus.Empty"
                      [class.occupied]="room.status === RoomStatus.Occupied"
                      [class.reserved]="room.status === RoomStatus.Reserved"
                      [class.maintenance]="room.status === RoomStatus.Maintenance"
                      (click)="onRoomClick(room)"
                      [title]="'Oda ' + room.roomNumber + ' - ' + getStatusLabel(room.status)"
                    >
                      <span class="fp-room-num">{{ room.roomNumber }}</span>
                      <span class="fp-room-status">{{ getStatusLabel(room.status) }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (viewMode === 'grid') {
        <ng-container *ngFor="let floor of getFloors(); trackBy: trackByFloor">
          <div class="floor-section">
            <div class="floor-header">
              <div class="floor-label">
                <i class="pi pi-building"></i>
                <span>Kat {{ floor }}</span>
              </div>
              <div class="floor-stats">
                <span class="floor-stat">{{ getFloorRooms(floor).length }} oda</span>
              </div>
            </div>

            <div class="rooms-grid">
              <div *ngFor="let room of getFloorRooms(floor); trackBy: trackById"
                class="room-card"
                [class.empty]="room.status === RoomStatus.Empty"
                [class.occupied]="room.status === RoomStatus.Occupied"
                [class.reserved]="room.status === RoomStatus.Reserved"
                [class.maintenance]="room.status === RoomStatus.Maintenance"
                (click)="onRoomClick(room)"
              >
                <div class="room-top">
                  <span class="room-number">{{ room.roomNumber }}</span>
                  <span class="room-capacity">
                    <i class="pi pi-user"></i> {{ room.capacity }}
                  </span>
                </div>
                <div class="room-bottom">
                  <span class="room-status-badge">
                    {{ getStatusLabel(room.status) }}
                  </span>
                  <span class="room-rate">
                      {{ room.nightlyRateTki | tryFormat }}/gece
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      } @else if (viewMode === 'calendar') {
        <div class="calendar-view">
          <div class="calendar-nav">
            <button class="cal-nav-btn" (click)="prevMonth()"><i class="pi pi-chevron-left"></i></button>
            <h3 class="cal-month">{{ getMonthName() }} {{ calendarYear }}</h3>
            <button class="cal-nav-btn" (click)="nextMonth()"><i class="pi pi-chevron-right"></i></button>
          </div>
          <div class="calendar-grid">
            <div class="calendar-header-cell">Pzt</div>
            <div class="calendar-header-cell">Sal</div>
            <div class="calendar-header-cell">Çar</div>
            <div class="calendar-header-cell">Per</div>
            <div class="calendar-header-cell">Cum</div>
            <div class="calendar-header-cell">Cmt</div>
            <div class="calendar-header-cell">Paz</div>
            @for (day of calendarDays; track $index) {
              <div class="calendar-day"
                [class.today]="isToday(day)"
                [class.other-month]="day.getMonth() !== calendarMonth"
              >
                <span class="calendar-day-number">{{ day.getDate() }}</span>
                @for (evt of getEventsForDay(day); track $index) {
                  <div class="calendar-event" [class]="evt.type">
                    {{ evt.label }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <div *ngIf="rooms.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Henüz oda eklenmemiş.</p>
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
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
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

    .stats-bar {
      display: flex;
      gap: 0.75rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      min-width: 80px;
    }

    .stat-count {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 0.2rem;
    }

    .empty-stat { background: #D1FAE5; color: #065F46; }
    .occupied-stat { background: #FEE2E2; color: #991B1B; }
    .reserved-stat { background: #FEF3C7; color: #92400E; }
    .maintenance-stat { background: #E5E7EB; color: #374151; }

    .legend {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: #6b7280;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    .empty-dot { background: #10b981; }
    .occupied-dot { background: #C41E3A; }
    .reserved-dot { background: #f59e0b; }
    .maintenance-dot { background: #6b7280; }

    .floor-section {
      margin-bottom: 2rem;
    }

    .floor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding: 0.6rem 0;
      border-bottom: 2px solid #e9ecef;
    }

    .floor-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: #1B3A5C;
    }

    .floor-label i {
      color: #C41E3A;
    }

    .floor-stats {
      font-size: 0.82rem;
      color: #9ca3af;
    }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.85rem;
    }

    .room-card {
      border-radius: 12px;
      padding: 1.25rem 1rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .room-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    }

    .room-card:active {
      transform: translateY(-2px) scale(1.01);
    }

    .room-card.empty {
      background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
      border-color: rgba(16, 185, 129, 0.3);
      color: #065F46;
    }

    .room-card.occupied {
      background: linear-gradient(135deg, #FEE2E2, #FECACA);
      border-color: rgba(196, 30, 58, 0.3);
      color: #991B1B;
      animation: pulse-red 2s infinite;
    }

    .room-card.reserved {
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      border-color: rgba(245, 158, 11, 0.3);
      color: #92400E;
    }

    .room-card.maintenance {
      background: linear-gradient(135deg, #E5E7EB, #D1D5DB);
      border-color: rgba(107, 114, 128, 0.3);
      color: #374151;
    }

    @keyframes pulse-red {
      0%, 100% { box-shadow: 0 0 0 0 rgba(196, 30, 58, 0.3); }
      50% { box-shadow: 0 0 0 6px rgba(196, 30, 58, 0); }
    }

    .room-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .room-number {
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1;
    }

    .room-capacity {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.78rem;
      font-weight: 500;
      opacity: 0.7;
    }

    .room-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .room-status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.08);
    }

    .room-rate {
      font-size: 0.72rem;
      font-weight: 500;
      opacity: 0.7;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #9ca3af;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-state p {
      font-size: 1rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .stats-bar {
      display: flex;
      gap: 0.5rem;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.7rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .pill-num { font-weight: 800; font-size: 0.92rem; }
    .pill-lbl { font-size: 0.72rem; }

    .empty-pill { background: #D1FAE5; color: #065F46; }
    .occupied-pill { background: #FEE2E2; color: #991B1B; }
    .reserved-pill { background: #FEF3C7; color: #92400E; }
    .maintenance-pill { background: #E5E7EB; color: #374151; }

    .view-toggle {
      display: flex;
      background: #f1f3f5;
      border-radius: 10px;
      padding: 0.2rem;
      gap: 0.2rem;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-size: 0.78rem;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toggle-btn.active {
      background: #fff;
      color: #0A1628;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .toggle-btn:hover:not(.active) { color: #374151; }

    .floorplan-view {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .floor-plan-section {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .floor-plan-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: #1B3A5C;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e9ecef;
    }

    .floor-plan-header i {
      color: #C41E3A;
    }

    .floor-plan-count {
      margin-left: auto;
      font-size: 0.82rem;
      font-weight: 500;
      color: #9ca3af;
    }

    .building-layout {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .room-row {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .corridor {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      margin: 0 2rem;
    }

    .corridor-line {
      flex: 1;
      height: 2px;
      background: repeating-linear-gradient(90deg, #d1d5db 0, #d1d5db 8px, transparent 8px, transparent 14px);
    }

    .corridor-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #9ca3af;
      letter-spacing: 2px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .fp-room {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 85px;
      height: 70px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
    }

    .fp-room:hover {
      transform: scale(1.1);
      z-index: 2;
    }

    .fp-room.empty {
      background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
      border-color: rgba(16, 185, 129, 0.3);
      color: #065F46;
    }

    .fp-room.occupied {
      background: linear-gradient(135deg, #FEE2E2, #FECACA);
      border-color: rgba(196, 30, 58, 0.3);
      color: #991B1B;
      animation: pulse-red 2s infinite;
    }

    .fp-room.reserved {
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      border-color: rgba(245, 158, 11, 0.3);
      color: #92400E;
    }

    .fp-room.maintenance {
      background: linear-gradient(135deg, #E5E7EB, #D1D5DB);
      border-color: rgba(107, 114, 128, 0.3);
      color: #374151;
    }

    .fp-room-num {
      font-size: 1.1rem;
      font-weight: 800;
      line-height: 1;
    }

    .fp-room-status {
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 0.2rem;
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; }
      .header-right { width: 100%; }
      .toggle-label { display: none; }
      .stats-bar { flex-wrap: wrap; }
      .fp-room { width: 65px; height: 55px; }
      .fp-room-num { font-size: 0.9rem; }
      .room-card { padding: 1rem 0.75rem; }
      .room-number { font-size: 1.4rem; }
    }

    :host-context(.dark) .page-header h2 { color: #e2e8f0; }
    :host-context(.dark) .page-desc { color: #94a3b8; }
    :host-context(.dark) .legend { background: #1e293b; }
    :host-context(.dark) .legend-item { color: #94a3b8; }
    :host-context(.dark) .floor-section { border-color: #334155; }
    :host-context(.dark) .floor-header { border-color: #334155; }
    :host-context(.dark) .floor-label { color: #e2e8f0; }
    :host-context(.dark) .floorplan-view .floor-plan-section { background: #1e293b; }
    :host-context(.dark) .corridor-label { color: #64748b; }
    :host-context(.dark) .toggle-btn { background: #1e293b; }
    :host-context(.dark) .toggle-btn.active { background: #334155; color: #e2e8f0; }

    .calendar-view {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    :host-context(.dark) .calendar-view { background: #1e293b; }

    .calendar-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .cal-nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1.5px solid #d1d5db;
      background: transparent;
      color: #374151;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .cal-nav-btn:hover { background: #f3f4f6; border-color: #9ca3af; }

    :host-context(.dark) .cal-nav-btn { border-color: #475569; color: #94a3b8; }
    :host-context(.dark) .cal-nav-btn:hover { background: #334155; }

    .cal-month {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0A1628;
      margin: 0;
      min-width: 180px;
      text-align: center;
    }

    :host-context(.dark) .cal-month { color: #e2e8f0; }
  `,
})
export class RoomsComponent implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);
  private signalr = inject(SignalrService);
  private cdr = inject(ChangeDetectorRef);

  rooms: RoomDto[] = [];
  activeReservations: ReservationDto[] = [];
  showCheckinModal = false;
  showCheckoutModal = false;
  selectedRoom: RoomDto | null = null;
  selectedReservation: ReservationDto | null = null;
  RoomStatus = RoomStatus;
  viewMode: 'grid' | 'floorplan' | 'calendar' = 'grid';
  Math = Math;
  calendarMonth = new Date().getMonth();
  calendarYear = new Date().getFullYear();
  calendarDays: Date[] = [];
  private signalrSub?: Subscription;

  ngOnInit(): void {
    this.loadRooms();
    this.signalrSub = this.signalr.roomStatus$.subscribe(() => {
      this.loadRooms();
    });
  }

  ngOnDestroy(): void {
    this.signalrSub?.unsubscribe();
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data.sort((a, b) => a.roomNumber - b.roomNumber);
          this.cdr.detectChanges();
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

  getFloors(): number[] {
    const floors = [...new Set(this.rooms.map(r => r.floor))];
    return floors.sort((a, b) => a - b);
  }

  getFloorRooms(floor: number): RoomDto[] {
    return this.rooms.filter(r => r.floor === floor);
  }

  getRoomCountByStatus(status: RoomStatus): number {
    return this.rooms.filter(r => r.status === status).length;
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

  trackByFloor(index: number, floor: number): number {
    return floor;
  }

  trackById(index: number, room: RoomDto): string {
    return room.id;
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

  buildCalendar(): void {
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const days: Date[] = [];
    const prevMonth = new Date(this.calendarYear, this.calendarMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(this.calendarYear, this.calendarMonth - 1, prevMonth.getDate() - i));
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(this.calendarYear, this.calendarMonth, d));
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push(new Date(this.calendarYear, this.calendarMonth + 1, d));
    }
    this.calendarDays = days;
  }

  prevMonth(): void {
    this.calendarMonth--;
    if (this.calendarMonth < 0) { this.calendarMonth = 11; this.calendarYear--; }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.calendarMonth++;
    if (this.calendarMonth > 11) { this.calendarMonth = 0; this.calendarYear++; }
    this.buildCalendar();
  }

  getMonthName(): string {
    const names = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return names[this.calendarMonth];
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
  }

  getEventsForDay(day: Date): { label: string; type: string }[] {
    const events: { label: string; type: string }[] = [];
    const dateStr = day.toISOString().slice(0, 10);
    for (const r of this.activeReservations) {
      const checkIn = r.checkInDate?.slice(0, 10);
      const checkOut = r.checkOutDate?.slice(0, 10);
      if (checkIn === dateStr) {
        events.push({ label: `${r.roomNumber} Giriş`, type: 'booked' });
      }
      if (checkOut === dateStr) {
        events.push({ label: `${r.roomNumber} Çıkış`, type: 'reserved' });
      }
    }
    return events.slice(0, 3);
  }
}
