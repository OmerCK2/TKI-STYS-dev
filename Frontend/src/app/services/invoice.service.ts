import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { InvoiceDto, InvoiceStatus } from '../models/invoice.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/Invoice`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<InvoiceDto[]>> {
    return this.http.get<ApiResponse<InvoiceDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<InvoiceDto>> {
    return this.http.get<ApiResponse<InvoiceDto>>(`${this.apiUrl}/${id}`);
  }

  getByReservationId(reservationId: string): Observable<ApiResponse<InvoiceDto>> {
    return this.http.get<ApiResponse<InvoiceDto>>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  getByStatus(status: InvoiceStatus): Observable<ApiResponse<InvoiceDto[]>> {
    return this.http.get<ApiResponse<InvoiceDto[]>>(`${this.apiUrl}/status/${status}`);
  }

  generate(reservationId: string): Observable<ApiResponse<InvoiceDto>> {
    return this.http.post<ApiResponse<InvoiceDto>>(`${this.apiUrl}/generate/${reservationId}`, {});
  }

  addExtra(invoiceId: string, description: string, amount: number): Observable<ApiResponse<InvoiceDto>> {
    return this.http.post<ApiResponse<InvoiceDto>>(`${this.apiUrl}/${invoiceId}/extras`, { description, amount });
  }

  updateStatus(id: string, status: InvoiceStatus): Observable<ApiResponse<InvoiceDto>> {
    return this.http.put<ApiResponse<InvoiceDto>>(`${this.apiUrl}/${id}/status`, { status });
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
