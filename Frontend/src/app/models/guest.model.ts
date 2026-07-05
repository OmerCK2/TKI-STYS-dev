export enum GuestType {
  TkiPersonnel = 0,
  Civilian = 1,
}

export interface GuestDto {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  type: GuestType;
  company?: string;
}

export interface CreateGuestDto {
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  type: GuestType;
  company?: string;
}
