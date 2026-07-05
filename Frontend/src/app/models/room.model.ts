export enum RoomStatus {
  Empty = 0,
  Occupied = 1,
  Reserved = 2,
  Maintenance = 3,
}

export interface RoomDto {
  id: string;
  roomNumber: number;
  floor: number;
  capacity: number;
  nightlyRateTki: number;
  nightlyRateCivilian: number;
  status: RoomStatus;
}

export interface CreateRoomDto {
  roomNumber: number;
  floor: number;
  capacity: number;
  nightlyRateTki: number;
  nightlyRateCivilian: number;
}
