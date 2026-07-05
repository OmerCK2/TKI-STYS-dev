import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReservationDto, CheckInDto, CheckOutDto } from '../models/reservation.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${environment.apiUrl}/Reservation`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ReservationDto[]>> {
    return this.http.get<ApiResponse<ReservationDto[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<ReservationDto[]>> {
    return this.http.get<ApiResponse<ReservationDto[]>>(`${this.apiUrl}/active`);
  }

  checkIn(dto: CheckInDto): Observable<ApiResponse<ReservationDto>> {
    return this.http.post<ApiResponse<ReservationDto>>(`${this.apiUrl}/check-in`, dto);
  }

  checkOut(dto: CheckOutDto): Observable<ApiResponse<ReservationDto>> {
    return this.http.post<ApiResponse<ReservationDto>>(`${this.apiUrl}/check-out`, dto);
  }
}
