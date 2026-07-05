import { Component, EventEmitter, Input, Output, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { RoomDto } from '../../models/room.model';
import { GuestType } from '../../models/guest.model';
import { ReservationService } from '../../services/reservation.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-checkin-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    InputMask,
    Select,
    DatePicker,
    ButtonModule,
    Dialog,
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      [visible]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      header="Check-in - Misafir Kayıt"
      [style]="{ width: '580px', maxHeight: '90vh' }"
      [closable]="true"
      (onHide)="onClose()"
    >
      @if (room) {
        <div class="checkin-content">
          <div class="room-badge">
            <i class="pi pi-home"></i>
            <span>Oda {{ room.roomNumber }}</span>
          </div>

          <form [formGroup]="checkinForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="field">
                <label for="nationalId">TC Kimlik No</label>
                <input
                  pInputText
                  id="nationalId"
                  formControlName="nationalId"
                  placeholder="11 haneli TC kimlik numarası"
                  maxlength="11"
                  [class.ng-invalid]="isFieldInvalid('nationalId')"
                />
                @if (isFieldInvalid('nationalId')) {
                  <small class="field-error">
                    @if (checkinForm.get('nationalId')?.errors?.['required']) {
                      Bu alan zorunludur
                    } @else if (checkinForm.get('nationalId')?.errors?.['pattern']) {
                      Sadece rakam ve tam 11 hane olmalıdır
                    }
                  </small>
                }
              </div>

              <div class="field">
                <label for="guestType">Misafir Tipi</label>
                <p-select
                  id="guestType"
                  formControlName="guestType"
                  [options]="guestTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seçiniz"
                  styleClass="w-full"
                ></p-select>
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="firstName">Adı</label>
                <input
                  pInputText
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Ad"
                  [class.ng-invalid]="isFieldInvalid('firstName')"
                />
                @if (isFieldInvalid('firstName')) {
                  <small class="field-error">
                    @if (checkinForm.get('firstName')?.errors?.['required']) {
                      Bu alan zorunludur
                    } @else if (checkinForm.get('firstName')?.errors?.['minlength']) {
                      En az 2 karakter olmalıdır
                    } @else if (checkinForm.get('firstName')?.errors?.['pattern']) {
                      Sadece harf içermelidir
                    }
                  </small>
                }
              </div>

              <div class="field">
                <label for="lastName">Soyadı</label>
                <input
                  pInputText
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Soyad"
                  [class.ng-invalid]="isFieldInvalid('lastName')"
                />
                @if (isFieldInvalid('lastName')) {
                  <small class="field-error">
                    @if (checkinForm.get('lastName')?.errors?.['required']) {
                      Bu alan zorunludur
                    } @else if (checkinForm.get('lastName')?.errors?.['minlength']) {
                      En az 2 karakter olmalıdır
                    } @else if (checkinForm.get('lastName')?.errors?.['pattern']) {
                      Sadece harf içermelidir
                    }
                  </small>
                }
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="phone">Telefon Numarası</label>
                <p-inputMask
                  id="phone"
                  formControlName="phoneNumber"
                  mask="(999) 999 99 99"
                  placeholder="(5XX) XXX XX XX"
                  [class.ng-invalid]="isFieldInvalid('phoneNumber')"
                ></p-inputMask>
                @if (isFieldInvalid('phoneNumber')) {
                  <small class="field-error">
                    @if (checkinForm.get('phoneNumber')?.errors?.['required']) {
                      Bu alan zorunludur
                    } @else if (checkinForm.get('phoneNumber')?.errors?.['pattern']) {
                      Geçerli bir telefon numarası giriniz
                    }
                  </small>
                }
              </div>

              <div class="field">
                <label for="checkInDate">Giriş Tarihi</label>
                <p-datePicker
                  id="checkInDate"
                  formControlName="checkInDate"
                  [showTime]="true"
                  [showIcon]="true"
                  dateFormat="dd.mm.yy"
                  placeholder="Tarih ve saat seçin"
                  styleClass="w-full"
                ></p-datePicker>
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
                type="submit"
                label="Kaydet ve Odaya Al"
                icon="pi pi-check"
                [loading]="isLoading"
                [disabled]="checkinForm.invalid || isLoading"
              ></button>
            </div>
          </form>
        </div>
      }
    </p-dialog>
  `,
  styles: `
    .checkin-content {
      padding: 0.5rem 0;
    }

    .room-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .field {
      margin-bottom: 0;
    }

    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.85rem;
    }

    input, :host ::ng-deep .p-inputtext {
      width: 100%;
    }

    :host ::ng-deep .p-select {
      width: 100%;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.78rem;
      margin-top: 0.3rem;
      display: block;
    }

    :host ::ng-deep input.ng-invalid.ng-touched,
    :host ::ng-deep .p-inputmask.ng-invalid.ng-touched .p-inputtext {
      border-color: #dc2626 !important;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e5e7eb;
    }
  `,
})
export class CheckinModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() room: RoomDto | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() checkinSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);

  checkinForm!: FormGroup;
  isLoading = false;

  guestTypes = [
    { label: 'TKİ Personeli', value: GuestType.TkiPersonnel },
    { label: 'Sivil Müşteri', value: GuestType.Civilian },
  ];

  constructor() {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.visible && this.room) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.checkinForm = this.fb.group({
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/)]],
      guestType: [GuestType.TkiPersonnel, Validators.required],
      checkInDate: [new Date(), Validators.required],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.checkinForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.checkinForm.reset({ guestType: GuestType.TkiPersonnel, checkInDate: new Date() });
  }

  onSubmit(): void {
    if (this.checkinForm.invalid || !this.room) return;

    this.isLoading = true;
    const formValue = this.checkinForm.value;

    const dto = {
      roomId: this.room.id,
      nationalId: formValue.nationalId,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber,
      guestType: formValue.guestType,
      checkInDate: formValue.checkInDate.toISOString(),
    };

    this.reservationService.checkIn(dto).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${formValue.firstName} ${formValue.lastName} başarıyla check-in yapıldı.`,
          });
          this.checkinSuccess.emit();
          this.onClose();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: res.message || 'Check-in işlemi başarısız oldu.',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: err.error?.message || 'Sunucu hatası oluştu.',
        });
      },
    });
  }
}
