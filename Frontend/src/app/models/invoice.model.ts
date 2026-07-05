import { GuestType } from './guest.model';
import { ExtraChargeDto } from './reservation.model';

export enum InvoiceStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
}

export interface InvoiceDto {
  id: string;
  reservationId: string;
  guestId: string;
  guestName: string;
  guestNationalId: string;
  guestType: GuestType;
  notes?: string;
  issueDate: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  nightlyRate: number;
  accommodationCost: number;
  extrasCost: number;
  totalAmount: number;
  status: InvoiceStatus;
  extras: ExtraChargeDto[];
}
