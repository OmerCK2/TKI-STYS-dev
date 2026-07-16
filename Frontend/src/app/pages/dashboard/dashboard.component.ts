import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { TryFormatPipe } from '../../pipes/ttry.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, TryFormatPipe],
  template: `
    <div class="dashboard-page">
      @if (loading) {
        <div class="skeleton-grid">
          <div class="sk-header"><div class="skeleton" style="height:32px;width:260px"></div></div>
          <div class="sk-stats">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height:110px;border-radius:14px"></div>
            }
          </div>
          <div class="sk-charts">
            <div class="skeleton" style="height:320px;border-radius:14px"></div>
            <div class="skeleton" style="height:320px;border-radius:14px"></div>
          </div>
          <div class="sk-bottom">
            <div class="skeleton" style="height:240px;border-radius:14px"></div>
            <div class="skeleton" style="height:240px;border-radius:14px"></div>
          </div>
        </div>
      } @else if (data) {
        <div class="dash-header">
          <div>
            <h2>Kontrol Paneli</h2>
            <p class="page-desc">Tesisinizin anlık durumu — {{ today | date:'dd MMMM yyyy, EEEE' }}</p>
          </div>
          <div class="header-actions">
            <a routerLink="/rooms" class="quick-link">
              <i class="pi pi-directions"></i> Kat Planı
            </a>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card" style="--accent:#1B3A5C">
            <div class="stat-icon-wrap"><i class="pi pi-building"></i></div>
            <div class="stat-body">
              <span class="stat-num">{{ data.totalRooms }}</span>
              <span class="stat-lbl">Toplam Oda</span>
            </div>
          </div>
          <div class="stat-card" style="--accent:#10b981">
            <div class="stat-icon-wrap success"><i class="pi pi-check-circle"></i></div>
            <div class="stat-body">
              <span class="stat-num">{{ data.emptyRooms }}</span>
              <span class="stat-lbl">Müsait</span>
            </div>
          </div>
          <div class="stat-card" style="--accent:#C41E3A">
            <div class="stat-icon-wrap danger"><i class="pi pi-users"></i></div>
            <div class="stat-body">
              <span class="stat-num">{{ data.occupiedRooms }}</span>
              <span class="stat-lbl">Dolu</span>
            </div>
          </div>
          <div class="stat-card" style="--accent:#f59e0b">
            <div class="stat-icon-wrap warning"><i class="pi pi-calendar"></i></div>
            <div class="stat-body">
              <span class="stat-num">{{ data.reservedRooms }}</span>
              <span class="stat-lbl">Rezerve</span>
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-card donut-card">
            <h3 class="card-title"><i class="pi pi-chart-pie"></i> Doluluk Oranı</h3>
            <div class="donut-wrap">
              <div class="donut-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#C41E3A" stroke-width="12"
                    [attr.stroke-dasharray]="getOccDash()" stroke-dashoffset="78.54"
                    stroke-linecap="round" class="donut-seg"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="12"
                    [attr.stroke-dasharray]="getEmptyDash()" [attr.stroke-dashoffset]="getEmptyOffset()"
                    stroke-linecap="round" class="donut-seg"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" stroke-width="12"
                    [attr.stroke-dasharray]="getResDash()" [attr.stroke-dashoffset]="getResOffset()"
                    stroke-linecap="round" class="donut-seg"/>
                </svg>
                <div class="donut-center">
                  <span class="donut-pct">{{ data.occupancyRate }}%</span>
                  <span class="donut-sub">Doluluk</span>
                </div>
              </div>
              <div class="donut-legend">
                <div class="leg-row"><span class="leg-dot" style="background:#C41E3A"></span><span class="leg-name">Dolu</span><span class="leg-val">{{ data.occupiedRooms }}</span></div>
                <div class="leg-row"><span class="leg-dot" style="background:#10b981"></span><span class="leg-name">Boş</span><span class="leg-val">{{ data.emptyRooms }}</span></div>
                <div class="leg-row"><span class="leg-dot" style="background:#f59e0b"></span><span class="leg-name">Rezerve</span><span class="leg-val">{{ data.reservedRooms }}</span></div>
                <div class="leg-row"><span class="leg-dot" style="background:#9ca3af"></span><span class="leg-name">Bakım</span><span class="leg-val">{{ data.maintenanceRooms }}</span></div>
              </div>
            </div>
          </div>

          <div class="chart-card bars-card">
            <h3 class="card-title"><i class="pi pi-chart-bar"></i> Kat Dolulukları</h3>
            <div class="floor-bars">
              @for (f of data.floorOccupancy; track f.floor) {
                <div class="floor-row">
                  <span class="fl-label">{{ f.floor }}. Kat</span>
                  <div class="fl-bar-track">
                    <div class="fl-bar-fill occ" [style.width.%]="pct(f.occupied, f.total)"></div>
                    <div class="fl-bar-fill res" [style.width.%]="pct(f.reserved, f.total)"></div>
                  </div>
                  <span class="fl-count">{{ f.occupied }}/{{ f.total }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="chart-card activity-card">
            <h3 class="card-title"><i class="pi pi-history"></i> Son Aktiviteler</h3>
            <div class="act-list">
              @for (a of data.recentActivities; track $index) {
                <div class="act-item">
                  <div class="act-icon" [class.ci]="a.type==='check-in'" [class.co]="a.type==='check-out'">
                    <i [class]="a.type==='check-in'?'pi pi-sign-in':'pi pi-sign-out'"></i>
                  </div>
                  <div class="act-body">
                    <span class="act-desc">{{ a.description }}</span>
                    <span class="act-time">{{ a.timestamp | date:'dd.MM HH:mm' }}</span>
                  </div>
                  <span class="act-badge" [class.ci]="a.type==='check-in'" [class.co]="a.type==='check-out'">
                    {{ a.type==='check-in'?'Giriş':'Çıkış' }}
                  </span>
                </div>
              } @empty {
                <div class="empty-act"><i class="pi pi-inbox"></i><p>Henüz aktivite yok</p></div>
              }
            </div>
          </div>

          <div class="chart-card summary-card">
            <h3 class="card-title"><i class="pi pi-bolt"></i> Hızlı İşlemler</h3>
            <div class="quick-grid">
              <a routerLink="/rooms" class="qk-card" style="--qk:#1B3A5C">
                <i class="pi pi-directions"></i>
                <span class="qk-title">Kat Planı</span>
                <span class="qk-desc">Oda durumunu görüntüle</span>
              </a>
              <a routerLink="/guests" class="qk-card" style="--qk:#C41E3A">
                <i class="pi pi-users"></i>
                <span class="qk-title">Misafirler</span>
                <span class="qk-desc">Kayıt listesi</span>
              </a>
              <a routerLink="/billing" class="qk-card" style="--qk:#10b981">
                <i class="pi pi-wallet"></i>
                <span class="qk-title">Faturalar</span>
                <span class="qk-desc">Ödeme takibi</span>
              </a>
              <a routerLink="/rooms" class="qk-card" style="--qk:#f59e0b">
                <i class="pi pi-plus-circle"></i>
                <span class="qk-title">Yeni Giriş</span>
                <span class="qk-desc">Check-in yap</span>
              </a>
            </div>
          </div>
        </div>

        <div class="revenue-row">
          <div class="chart-card rev-card">
            <h3 class="card-title"><i class="pi pi-wallet"></i> Gelir Özeti</h3>
            <div class="rev-grid">
              <div class="rev-item" style="--rv:#10b981">
                <span class="rv-label">Toplam Tahsilat</span>
                <span class="rv-val">{{ data.totalRevenue | tryFormat: 0 }}</span>
                <div class="rv-bar"><div class="rv-bar-fill" [style.width.%]="100"></div></div>
              </div>
              <div class="rev-item" style="--rv:#f59e0b">
                <span class="rv-label">Bekleyen Tutar</span>
                <span class="rv-val">{{ data.pendingRevenue | tryFormat: 0 }}</span>
                <div class="rv-bar"><div class="rv-bar-fill" [style.width.%]="getPendingPct()"></div></div>
              </div>
              <div class="rev-item" style="--rv:#1B3A5C">
                <span class="rv-label">Toplam Ciro</span>
                <span class="rv-val">{{ (data.totalRevenue + data.pendingRevenue) | tryFormat: 0 }}</span>
                <div class="rv-bar"><div class="rv-bar-fill" [style.width.%]="100"></div></div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .dashboard-page { padding: 0; animation: fadeIn 0.4s ease; }

    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
    }

    .dash-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #0A1628; }
    .page-desc { font-size: 0.85rem; color: #6b7280; margin: 0.25rem 0 0; }

    .quick-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
      background: linear-gradient(135deg, #1B3A5C, #0D1F33); color: #fff;
      box-shadow: 0 4px 12px rgba(27,58,92,0.2); text-decoration: none; transition: all 0.2s;
    }

    .quick-link:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(27,58,92,0.3); }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.25rem; }

    .stat-card {
      background: #fff; border-radius: 14px; padding: 1.15rem; display: flex; align-items: center; gap: 0.85rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid transparent; transition: all 0.25s;
    }

    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: #e5e7eb; }

    .stat-icon-wrap {
      width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-size: 1.15rem; background: #EFF6FF; color: #1B3A5C;
    }

    .stat-icon-wrap.success { background: #ECFDF5; color: #10b981; }
    .stat-icon-wrap.danger { background: #FEF2F2; color: #C41E3A; }
    .stat-icon-wrap.warning { background: #FFFBEB; color: #f59e0b; }

    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.6rem; font-weight: 800; color: #1f2937; line-height: 1; }
    .stat-lbl { font-size: 0.75rem; color: #6b7280; font-weight: 500; margin-top: 0.15rem; }

    /* Charts */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }

    .chart-card {
      background: #fff; border-radius: 14px; padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .card-title {
      font-size: 0.92rem; font-weight: 700; color: #0A1628; margin: 0 0 1.25rem;
      display: flex; align-items: center; gap: 0.5rem;
    }

    .card-title i { color: #C41E3A; font-size: 0.88rem; }

    /* Donut */
    .donut-wrap { display: flex; align-items: center; gap: 2rem; }
    .donut-ring { position: relative; width: 150px; height: 150px; }
    .donut-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-seg { transition: all 0.8s cubic-bezier(0.4,0,0.2,1); }
    .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .donut-pct { font-size: 1.7rem; font-weight: 900; color: #0A1628; }
    .donut-sub { font-size: 0.72rem; color: #6b7280; }

    .donut-legend { display: flex; flex-direction: column; gap: 0.55rem; }
    .leg-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #374151; }
    .leg-dot { width: 10px; height: 10px; border-radius: 3px; }
    .leg-val { margin-left: auto; font-weight: 700; color: #1f2937; min-width: 24px; text-align: right; }

    /* Floor bars */
    .floor-bars { display: flex; flex-direction: column; gap: 0.85rem; }
    .floor-row { display: flex; align-items: center; gap: 0.75rem; }
    .fl-label { width: 52px; font-size: 0.82rem; font-weight: 600; color: #374151; white-space: nowrap; }
    .fl-bar-track { flex: 1; height: 22px; background: #f1f5f9; border-radius: 6px; display: flex; overflow: hidden; }
    .fl-bar-fill { height: 100%; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
    .fl-bar-fill.occ { background: linear-gradient(90deg, #C41E3A, #e74c6f); }
    .fl-bar-fill.res { background: #f59e0b; }
    .fl-count { font-size: 0.75rem; color: #6b7280; min-width: 40px; text-align: right; font-weight: 600; }

    /* Activity */
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }

    .act-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 280px; overflow-y: auto; }
    .act-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.5rem; border-radius: 10px; transition: background 0.15s; }
    .act-item:hover { background: #f8f9fa; }
    .act-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; }
    .act-icon.ci { background: #ECFDF5; color: #10b981; }
    .act-icon.co { background: #FEF2F2; color: #C41E3A; }
    .act-body { flex: 1; }
    .act-desc { font-size: 0.82rem; font-weight: 500; color: #1f2937; display: block; }
    .act-time { font-size: 0.7rem; color: #9ca3af; }
    .act-badge { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
    .act-badge.ci { background: #ECFDF5; color: #10b981; }
    .act-badge.co { background: #FEF2F2; color: #C41E3A; }
    .empty-act { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-act i { font-size: 1.75rem; display: block; margin-bottom: 0.5rem; }

    /* Quick actions */
    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
    .qk-card {
      display: flex; flex-direction: column; padding: 1.1rem; border-radius: 12px; cursor: pointer;
      background: #f8f9fa; text-decoration: none; transition: all 0.25s; border: 1px solid transparent;
    }
    .qk-card:hover { background: #fff; border-color: var(--qk); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
    .qk-card i { font-size: 1.35rem; color: var(--qk); margin-bottom: 0.5rem; }
    .qk-title { font-size: 0.88rem; font-weight: 700; color: #0A1628; }
    .qk-desc { font-size: 0.72rem; color: #9ca3af; margin-top: 0.1rem; }

    /* Revenue */
    .revenue-row { margin-bottom: 1rem; }
    .rev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
    .rev-item { display: flex; flex-direction: column; padding: 1.15rem; border-radius: 12px; background: #f8f9fa; }
    .rv-label { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-bottom: 0.4rem; }
    .rv-val { font-size: 1.3rem; font-weight: 800; color: var(--rv); margin-bottom: 0.6rem; }
    .rv-bar { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
    .rv-bar-fill { height: 100%; background: var(--rv); border-radius: 3px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }

    /* Skeleton */
    .sk-header { margin-bottom: 1.5rem; }
    .sk-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.25rem; }
    .sk-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
    .sk-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: repeat(2,1fr); }
      .charts-row, .bottom-row, .sk-charts, .sk-bottom { grid-template-columns: 1fr; }
      .rev-grid { grid-template-columns: 1fr; }
      .sk-stats { grid-template-columns: repeat(2,1fr); }
    }

    @media (max-width: 640px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .donut-wrap { flex-direction: column; }
      .quick-grid { grid-template-columns: 1fr; }
    }

    :host-context(.dark) .dash-header h2 { color: #e2e8f0; }
    :host-context(.dark) .page-desc { color: #94a3b8; }
    :host-context(.dark) .stat-card, :host-context(.dark) .chart-card { background: #1e293b; }
    :host-context(.dark) .stat-num { color: #e2e8f0; }
    :host-context(.dark) .card-title { color: #e2e8f0; }
    :host-context(.dark) .donut-pct { color: #e2e8f0; }
    :host-context(.dark) .leg-row, :host-context(.dark) .act-desc { color: #e2e8f0; }
    :host-context(.dark) .leg-val, :host-context(.dark) .fl-count { color: #e2e8f0; }
    :host-context(.dark) .fl-label { color: #cbd5e1; }
    :host-context(.dark) .fl-bar-track { background: #334155; }
    :host-context(.dark) .qk-card { background: #0f172a; }
    :host-context(.dark) .qk-card:hover { background: #1e293b; }
    :host-context(.dark) .qk-title { color: #e2e8f0; }
    :host-context(.dark) .rev-item { background: #0f172a; }
    :host-context(.dark) .rv-bar { background: #334155; }
    :host-context(.dark) .act-item:hover { background: #334155; }
  `,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  data: DashboardData | null = null;
  loading = true;
  today = new Date();

  private total = 314.16;

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.data = res.data;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  pct(v: number, t: number): number { return t > 0 ? (v / t) * 100 : 0; }

  getOccDash(): string {
    if (!this.data) return '0 314.16';
    const occ = (this.data.occupancyRate / 100) * this.total;
    return `${occ} ${this.total}`;
  }

  getEmptyDash(): string {
    if (!this.data) return '0 314.16';
    const emp = (this.data.emptyRooms / this.data.totalRooms) * this.total;
    return `${emp} ${this.total}`;
  }

  getEmptyOffset(): string {
    if (!this.data) return '0';
    const occ = (this.data.occupancyRate / 100) * this.total;
    return `${78.54 - occ}`;
  }

  getResDash(): string {
    if (!this.data) return '0 314.16';
    const res = (this.data.reservedRooms / this.data.totalRooms) * this.total;
    return `${res} ${this.total}`;
  }

  getResOffset(): string {
    if (!this.data) return '0';
    const occ = (this.data.occupancyRate / 100) * this.total;
    const emp = (this.data.emptyRooms / this.data.totalRooms) * this.total;
    return `${78.54 - occ - emp}`;
  }

  getPendingPct(): number {
    if (!this.data || !this.data.totalRevenue) return 0;
    return (this.data.pendingRevenue / (this.data.totalRevenue + this.data.pendingRevenue)) * 100;
  }
}
