import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { RoomDto, CreateRoomDto, RoomStatus } from '../models/room.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/Room`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<RoomDto[]>> {
    return this.http.get<ApiResponse<RoomDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<RoomDto>> {
    return this.http.get<ApiResponse<RoomDto>>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: RoomStatus): Observable<ApiResponse<RoomDto[]>> {
    return this.http.get<ApiResponse<RoomDto[]>>(`${this.apiUrl}/status/${status}`);
  }

  create(dto: CreateRoomDto): Observable<ApiResponse<RoomDto>> {
    return this.http.post<ApiResponse<RoomDto>>(this.apiUrl, dto);
  }

  updateStatus(id: string, status: RoomStatus): Observable<ApiResponse<RoomDto>> {
    return this.http.put<ApiResponse<RoomDto>>(`${this.apiUrl}/${id}/status`, { status });
  }
}
