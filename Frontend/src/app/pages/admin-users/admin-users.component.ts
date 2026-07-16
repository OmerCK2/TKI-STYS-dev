import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../models/auth.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    InputText,
    Tag,
    ButtonModule,
    Dialog,
    Toast,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="admin-page">
      <div class="page-header">
        <div>
          <h2>Kullanıcı Yönetimi</h2>
          <p class="page-desc">Personel hesaplarını yönetin, yeni kullanıcılar oluşturun.</p>
        </div>
        <button
          pButton
          icon="pi pi-plus"
          label="Yeni Kullanıcı"
          class="create-btn"
          (click)="showCreateDialog = true"
        ></button>
      </div>

      <div class="table-card">
        <p-table
          [value]="users"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} - {last} / {totalRecords} kayıt"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Kullanıcı Adı</th>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Durum</th>
              <th style="width: 120px; text-align: center">İşlem</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td class="mono-cell">{{ user.username }}</td>
              <td class="name-cell">{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <p-tag
                  [value]="user.isAdmin ? 'Yönetici' : 'Personel'"
                  [severity]="user.isAdmin ? 'danger' : 'info'"
                ></p-tag>
              </td>
              <td>
                @if (user.requiresPasswordChange) {
                  <p-tag value="Şifre Bekliyor" severity="warn"></p-tag>
                } @else {
                  <p-tag value="Aktif" severity="success"></p-tag>
                }
              </td>
              <td style="text-align: center">
                <button
                  pButton
                  icon="pi pi-key"
                  class="p-button-warning p-button-sm p-button-text"
                  pTooltip="Varsayılan şifreyi sıfırla"
                  (click)="resetPassword(user)"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">Henüz kullanıcı eklenmemiş.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [visible]="showCreateDialog"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      header="Yeni Kullanıcı Oluştur"
      [style]="{ width: '500px' }"
      [closable]="true"
      (onHide)="onDialogClose()"
    >
      <form [formGroup]="createForm" (ngSubmit)="onCreate()">
        <div class="form-grid">
          <div class="field">
            <label for="firstName">Ad</label>
            <input pInputText id="firstName" formControlName="firstName" placeholder="Ad" />
            @if (createForm.get('firstName')?.invalid && createForm.get('firstName')?.touched) {
              <small class="field-error">Zorunludur</small>
            }
          </div>
          <div class="field">
            <label for="lastName">Soyad</label>
            <input pInputText id="lastName" formControlName="lastName" placeholder="Soyad" />
            @if (createForm.get('lastName')?.invalid && createForm.get('lastName')?.touched) {
              <small class="field-error">Zorunludur</small>
            }
          </div>
        </div>

        <div class="field">
          <label for="username">Kullanıcı Adı</label>
          <input pInputText id="username" formControlName="username" placeholder="Kullanıcı adı" />
          @if (createForm.get('username')?.invalid && createForm.get('username')?.touched) {
            <small class="field-error">Zorunludur</small>
          }
        </div>

        <div class="field">
          <label for="email">E-posta</label>
          <input pInputText id="email" formControlName="email" placeholder="ornek&#64;tki.gov.tr" type="email" />
          @if (createForm.get('email')?.invalid && createForm.get('email')?.touched) {
            <small class="field-error">Geçerli bir e-posta giriniz</small>
          }
        </div>

        <div class="field checkbox-field">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="isAdmin" />
            <span>Yönetici yetkisi ver</span>
          </label>
        </div>

        <div class="info-box">
          <i class="pi pi-info-circle"></i>
          <span>Oluşturulan kullanıcıya varsayılan şifre: <strong>TKI2024!</strong> — İlk girişte şifre değiştirmesi istenecektir.</span>
        </div>

        @if (createError) {
          <div class="error-box">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ createError }}</span>
          </div>
        }

        <div class="dialog-actions">
          <button pButton type="button" label="İptal" class="p-button-secondary" (click)="onDialogClose()"></button>
          <button
            pButton
            type="submit"
            label="Kullanıcı Oluştur"
            icon="pi pi-check"
            [loading]="isCreating"
            [disabled]="createForm.invalid || isCreating"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: `
    .admin-page {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
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

    :host ::ng-deep .create-btn {
      background: linear-gradient(135deg, #C41E3A, #8B0000) !important;
      border: none !important;
      box-shadow: 0 2px 8px rgba(196, 30, 58, 0.25) !important;
    }

    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .mono-cell {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }

    .name-cell {
      font-weight: 600;
    }

    .empty-message {
      text-align: center;
      padding: 2rem !important;
      color: #9ca3af;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.35rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.85rem;
    }

    input[type="text"], input[type="email"] {
      width: 100%;
    }

    .field-error {
      color: #C41E3A;
      font-size: 0.78rem;
      margin-top: 0.25rem;
      display: block;
    }

    .checkbox-field {
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex !important;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500 !important;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #C41E3A;
    }

    .info-box {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin: 1rem 0;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #1E40AF;
      line-height: 1.4;
    }

    .info-box i {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .error-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #C41E3A;
      font-size: 0.85rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }
  `,
})
export class AdminUsersComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  users: UserDto[] = [];
  showCreateDialog = false;
  createForm!: FormGroup;
  isCreating = false;
  createError = '';

  constructor() {
    this.createForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isAdmin: [false],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users = res.data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Kullanıcı listesi yüklenemedi.',
        });
      },
    });
  }

  onCreate(): void {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    this.createError = '';

    this.authService.createUser(this.createForm.value).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: res.message || 'Kullanıcı başarıyla oluşturuldu.',
          });
          this.loadUsers();
          this.onDialogClose();
        } else {
          this.createError = res.message || 'Kullanıcı oluşturulamadı.';
        }
      },
      error: (err) => {
        this.isCreating = false;
        this.createError = err.error?.message || 'Sunucu hatası oluştu.';
      },
    });
  }

  resetPassword(user: UserDto): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Bilgi',
      detail: `${user.username} kullanıcısının şifresi varsayılan şifreye sıfırlandı.`,
    });
  }

  onDialogClose(): void {
    this.showCreateDialog = false;
    this.createForm.reset({ isAdmin: false });
    this.createError = '';
  }
}
