import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/auth.model';

export interface DashboardData {
  totalRooms: number;
  occupiedRooms: number;
  emptyRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  activeGuests: number;
  totalGuests: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  pendingRevenue: number;
  recentActivities: RecentActivity[];
  floorOccupancy: FloorOccupancy[];
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  roomNumber: number;
}

export interface FloorOccupancy {
  floor: number;
  total: number;
  occupied: number;
  reserved: number;
  empty: number;
  maintenance: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(this.apiUrl);
  }
}
