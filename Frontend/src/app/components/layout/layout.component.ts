import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignalrService } from '../../services/signalr.service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="layout-wrapper">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo-container">
            <div class="logo-icon">
              <img src="assets/logo.svg" alt="TKİ" class="logo-img" />
            </div>
            @if (!sidebarCollapsed) {
              <div class="logo-text">
                <span class="logo-title">TKİ</span>
                <span class="logo-subtitle">Sosyal Tesis Yönetim</span>
              </div>
            }
          </div>
          <button class="collapse-btn" (click)="sidebarCollapsed = !sidebarCollapsed">
            <i [class]="sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <div class="nav-icon"><i class="pi pi-chart-bar"></i></div>
            @if (!sidebarCollapsed) { <span class="nav-label">Kontrol Paneli</span> }
          </a>
          <a routerLink="/rooms" routerLinkActive="active" class="nav-item">
            <div class="nav-icon"><i class="pi pi-home"></i></div>
            @if (!sidebarCollapsed) { <span class="nav-label">Kroki / Odalar</span> }
          </a>
          <a routerLink="/guests" routerLinkActive="active" class="nav-item">
            <div class="nav-icon"><i class="pi pi-users"></i></div>
            @if (!sidebarCollapsed) { <span class="nav-label">Misafirler</span> }
          </a>
          <a routerLink="/billing" routerLinkActive="active" class="nav-item">
            <div class="nav-icon"><i class="pi pi-wallet"></i></div>
            @if (!sidebarCollapsed) { <span class="nav-label">Faturalar</span> }
          </a>

          @if (auth.isAdmin()) {
            <div class="nav-divider"></div>
            @if (!sidebarCollapsed) {
              <div class="nav-section-label">Yönetim</div>
            }
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item admin-nav">
              <div class="nav-icon"><i class="pi pi-cog"></i></div>
              @if (!sidebarCollapsed) { <span class="nav-label">Kullanıcı Yönetimi</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/profile" class="user-info" [class.collapsed]="sidebarCollapsed">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            @if (!sidebarCollapsed) {
              <div class="user-details">
                <span class="user-name">{{ getDisplayName() }}</span>
                <span class="user-role">{{ auth.isAdmin() ? 'Yönetici' : 'Personel' }}</span>
              </div>
            }
          </a>
        </div>
      </aside>

      <div class="main-wrapper" [class.sidebar-collapsed]="sidebarCollapsed">
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">Sosyal Tesis Yönetim Sistemi</h1>
          </div>
          <div class="topbar-right">
            <div class="topbar-datetime">
              <i class="pi pi-clock"></i>
              <span>{{ currentDate | date:'dd.MM.yyyy HH:mm' }}</span>
            </div>
            <div class="connection-badge" [class.connected]="isConnected">
              <span class="status-dot"></span>
              <span class="status-text">{{ isConnected ? 'Canlı' : 'Bağlantı Yok' }}</span>
            </div>
            <div class="notification-badge" (click)="toggleNotifications($event)">
              <button class="icon-btn">
                <i class="pi pi-bell"></i>
              </button>
              @if (notifications.length > 0) {
                <span class="badge-count">{{ notifications.length > 9 ? '9+' : notifications.length }}</span>
              }
            </div>
            @if (showNotifications) {
              <div class="notification-dropdown" (click)="$event.stopPropagation()">
                <div class="notification-header">
                  <h4>Bildirimler</h4>
                  @if (notifications.length > 0) {
                    <button class="clear-all-btn" (click)="clearNotifications()">Temizle</button>
                  }
                </div>
                <div class="notification-list">
                  @for (n of notifications; track $index) {
                    <div class="notification-item" [class.unread]="!n.read">
                      <div class="notif-icon" [class]="n.type">
                        <i [class]="n.type === 'check-in' ? 'pi pi-sign-in' : n.type === 'check-out' ? 'pi pi-sign-out' : n.type === 'reservation' ? 'pi pi-calendar' : 'pi pi-info-circle'"></i>
                      </div>
                      <div class="notif-content">
                        <span class="notif-text">{{ n.message }}</span>
                        <span class="notif-time">{{ n.time }}</span>
                      </div>
                      @if (!n.read) {
                        <div class="notif-dot"></div>
                      }
                    </div>
                  } @empty {
                    <div class="notification-empty">
                      <i class="pi pi-bell-slash"></i>
                      <p>Henüz bildirim yok</p>
                    </div>
                  }
                </div>
              </div>
            }
            <button class="theme-toggle" (click)="toggleDarkMode()" [title]="isDarkMode ? 'Açık Mod' : 'Karanlık Mod'">
              <i [class]="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            <button class="logout-btn" (click)="showLogoutConfirm = true" title="Çıkış Yap">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </header>

        <main class="main-content animate-fade-in">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    @if (showLogoutConfirm) {
      <div class="modal-overlay" (click)="showLogoutConfirm = false">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon"><i class="pi pi-sign-out"></i></div>
          <h3>Çıkış Yapmak İstiyor musunuz?</h3>
          <p>Oturumunuz kapatılacak ve ana sayfaya yönlendirileceksiniz.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="showLogoutConfirm = false">İptal</button>
            <button class="btn-confirm" (click)="onLogout()">Çıkış Yap</button>
          </div>
        </div>
      </div>
    }

    @if (showSearch) {
      <div class="modal-overlay" (click)="showSearch = false">
        <div class="search-modal" (click)="$event.stopPropagation()">
          <div class="search-input-wrap">
            <i class="pi pi-search"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Sayfa ara... (Ctrl+K)"
              autofocus
              (keydown.escape)="showSearch = false"
              (keydown.enter)="onSearchEnter()"
            />
            <kbd class="kbd">ESC</kbd>
          </div>
          <div class="search-results">
            <button class="search-item" (click)="navigateSearch('/dashboard')">
              <i class="pi pi-chart-bar"></i><span>Kontrol Paneli</span>
            </button>
            <button class="search-item" (click)="navigateSearch('/rooms')">
              <i class="pi pi-directions"></i><span>Kat Planı / Odalar</span>
            </button>
            <button class="search-item" (click)="navigateSearch('/guests')">
              <i class="pi pi-users"></i><span>Misafirler</span>
            </button>
            <button class="search-item" (click)="navigateSearch('/billing')">
              <i class="pi pi-wallet"></i><span>Faturalar</span>
            </button>
            <button class="search-item" (click)="navigateSearch('/profile')">
              <i class="pi pi-user"></i><span>Profilim</span>
            </button>
            @if (auth.isAdmin()) {
              <button class="search-item" (click)="navigateSearch('/admin/users')">
                <i class="pi pi-cog"></i><span>Kullanıcı Yönetimi</span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--tki-bg);
    }

    /* SIDEBAR */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #0A1628 0%, #0D1F33 50%, #1B3A5C 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 1000;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      min-height: 64px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
      overflow: hidden;
    }

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      white-space: nowrap;
    }

    .logo-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #fff;
    }

    .logo-subtitle {
      font-size: 0.65rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 1px;
    }

    .collapse-btn {
      background: rgba(255, 255, 255, 0.06);
      border: none;
      color: rgba(255, 255, 255, 0.5);
      width: 28px;
      height: 28px;
      min-width: 28px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 0.75rem;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }

    /* NAVIGATION */
    .sidebar-nav {
      flex: 1;
      padding: 0.75rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.875rem;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.88rem;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 2px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: rgba(196, 30, 58, 0.6);
      border-radius: 10px 0 0 10px;
      transition: width 0.2s;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.9);
    }

    .nav-item.active {
      background: rgba(196, 30, 58, 0.15);
      color: #fff;
      font-weight: 600;
    }

    .nav-item.active::before {
      width: 3px;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      min-width: 22px;
      font-size: 1rem;
    }

    .nav-label {
      white-space: nowrap;
    }

    .nav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 0.5rem 0.75rem;
    }

    .nav-section-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.3);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 0.5rem 0.875rem 0.25rem;
    }

    /* SIDEBAR FOOTER */
    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 10px;
      transition: background 0.2s;
      cursor: pointer;
      text-decoration: none;
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .user-info.collapsed {
      justify-content: center;
      padding: 0.5rem 0;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      min-width: 34px;
      background: linear-gradient(135deg, #C41E3A, #1B3A5C);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.68rem;
      color: rgba(255, 255, 255, 0.45);
    }

    /* MAIN AREA */
    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-wrapper.sidebar-collapsed {
      margin-left: 72px;
    }

    /* TOPBAR */
    .topbar {
      height: 60px;
      background: #fff;
      border-bottom: 1px solid var(--tki-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .page-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--tki-blue);
      letter-spacing: -0.2px;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: #6b7280;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .icon-btn:hover {
      background: #f3f4f6;
      color: #0A1628;
    }

    html.dark .icon-btn:hover {
      background: #334155;
      color: #e2e8f0;
    }

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

    .notification-badge {
      position: relative;
      cursor: pointer;
    }

    .topbar-datetime {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--tki-text-muted);
      background: #f8f9fa;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
    }

    .topbar-datetime i {
      color: #9ca3af;
      font-size: 0.78rem;
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      background: #FEF2F2;
      color: #ef4444;
      transition: all 0.3s;
    }

    .connection-badge.connected {
      background: #ECFDF5;
      color: #10b981;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .connection-badge.connected .status-dot {
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1.5px solid #d1d5db;
      background: transparent;
      color: #6b7280;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.88rem;
    }

    .theme-toggle:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
      color: #0A1628;
      transform: scale(1.05);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1.5px solid var(--tki-red);
      background: transparent;
      color: var(--tki-red);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.88rem;
    }

    .logout-btn:hover {
      background: var(--tki-red);
      color: #fff;
      transform: scale(1.05);
    }

    /* MAIN CONTENT */
    .main-content {
      flex: 1;
      padding: 1.5rem;
    }

    @media (max-width: 768px) {
      .sidebar { width: 72px; }
      .main-wrapper { margin-left: 72px; }
      .topbar-datetime { display: none; }
      .connection-badge .status-text { display: none; }
    }

    /* Search Modal */
    .search-modal {
      background: #fff;
      border-radius: 16px;
      width: 520px;
      max-width: 95vw;
      box-shadow: 0 25px 80px rgba(0,0,0,0.25);
      overflow: hidden;
      animation: scaleIn 0.2s ease;
    }

    html.dark .search-modal { background: #1e293b; }

    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e5e7eb;
    }

    html.dark .search-input-wrap { border-color: #334155; }

    .search-input-wrap i { color: #9ca3af; font-size: 1.1rem; }

    .search-input-wrap input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      background: transparent;
      color: #1f2937;
    }

    html.dark .search-input-wrap input { color: #e2e8f0; }

    .kbd {
      font-size: 0.65rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      color: #6b7280;
      font-family: monospace;
    }

    html.dark .kbd { background: #334155; border-color: #475569; color: #94a3b8; }

    .search-results { padding: 0.5rem; }

    .search-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
      transition: all 0.15s;
      text-align: left;
    }

    .search-item:hover { background: #f3f4f6; }

    html.dark .search-item { color: #e2e8f0; }
    html.dark .search-item:hover { background: #334155; }

    .search-item i { color: #9ca3af; width: 20px; text-align: center; }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `,
})
export class LayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private signalr = inject(SignalrService);
  private router = inject(Router);

  sidebarCollapsed = false;
  currentDate = new Date();
  isConnected = false;
  isDarkMode = false;
  showLogoutConfirm = false;
  showNotifications = false;
  showSearch = false;
  searchQuery = '';
  private dateInterval: any;
  private notifSub: any;

  notifications: { message: string; time: string; type: string; read: boolean }[] = [];

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('tki-dark-mode') === 'true';
    if (this.isDarkMode) document.documentElement.classList.add('dark');
    this.signalr.connect();
    this.signalr.connectionState$.subscribe((state: HubConnectionState) => {
      this.isConnected = state === HubConnectionState.Connected;
    });
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    this.notifSub = this.signalr.roomStatus$.subscribe((data: any) => {
      if (data) {
        const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const type = data.status === 'occupied' ? 'check-in' : data.status === 'empty' ? 'check-out' : 'reservation';
        const label = data.status === 'occupied' ? 'Giriş' : data.status === 'empty' ? 'Çıkış' : 'Rezerve';
        this.notifications.unshift({
          message: `Oda ${data.roomNumber || '?'} - ${label} yapıldı`,
          time: now,
          type,
          read: false,
        });
        if (this.notifications.length > 50) this.notifications.pop();
      }
    });

    document.addEventListener('click', this.closeNotifications.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy(): void {
    clearInterval(this.dateInterval);
    this.notifSub?.unsubscribe();
    document.removeEventListener('click', this.closeNotifications.bind(this));
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      this.showSearch = !this.showSearch;
    }
    if (e.key === 'Escape') {
      this.showSearch = false;
      this.showNotifications = false;
      this.showLogoutConfirm = false;
    }
  }

  navigateSearch(path: string): void {
    this.showSearch = false;
    this.router.navigate([path]);
  }

  onSearchEnter(): void {
    const q = this.searchQuery.toLowerCase();
    const routes = [
      { path: '/dashboard', keywords: ['kontrol', 'panel', 'dashboard', 'ana sayfa'] },
      { path: '/rooms', keywords: ['oda', 'kroki', 'kat planı', 'rooms'] },
      { path: '/guests', keywords: ['misafir', 'müşteri', 'guests'] },
      { path: '/billing', keywords: ['fatura', 'ödeme', 'muhasebe', 'billing'] },
      { path: '/profile', keywords: ['profil', 'hesap', 'profile'] },
      { path: '/admin/users', keywords: ['yönetici', 'kullanıcı', 'admin'] },
    ];
    const match = routes.find(r => r.keywords.some(k => q.includes(k)));
    if (match) {
      this.navigateSearch(match.path);
    } else {
      this.navigateSearch('/dashboard');
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('tki-dark-mode', String(this.isDarkMode));
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  getUserInitials(): string {
    const user = this.auth.currentUser();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'TK';
  }

  getDisplayName(): string {
    const user = this.auth.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Kullanıcı';
  }

  onLogout(): void {
    this.showLogoutConfirm = false;
    this.signalr.disconnect();
    this.auth.logout();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
}
