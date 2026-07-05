import { GuestType } from './guest.model';

export interface ReservationDto {
  id: string;
  roomId: string;
  guestId: string;
  roomNumber: number;
  guestName: string;
  checkInDate: string;
  checkOutDate?: string;
  isActive: boolean;
}

export interface CheckInDto {
  roomId: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  guestType: GuestType;
  company?: string;
  checkInDate: string;
}

export interface CheckOutDto {
  reservationId: string;
  checkOutDate: string;
  extras?: ExtraChargeDto[];
}

export interface ExtraChargeDto {
  id?: string;
  description: string;
  amount: number;
}
