import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GuestDto, CreateGuestDto } from '../models/guest.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly apiUrl = `${environment.apiUrl}/Guest`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<GuestDto[]>> {
    return this.http.get<ApiResponse<GuestDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<GuestDto>> {
    return this.http.get<ApiResponse<GuestDto>>(`${this.apiUrl}/${id}`);
  }

  getByNationalId(nationalId: string): Observable<ApiResponse<GuestDto>> {
    return this.http.get<ApiResponse<GuestDto>>(`${this.apiUrl}/national-id/${nationalId}`);
  }

  create(dto: CreateGuestDto): Observable<ApiResponse<GuestDto>> {
    return this.http.post<ApiResponse<GuestDto>>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateGuestDto): Observable<ApiResponse<GuestDto>> {
    return this.http.put<ApiResponse<GuestDto>>(`${this.apiUrl}/${id}`, dto);
  }
}
