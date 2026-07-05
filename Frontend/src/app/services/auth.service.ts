import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginDto, AuthResponseDto, UserDto, ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  private readonly _token = signal<string | null>(localStorage.getItem('auth_token'));
  private readonly _user = signal<UserDto | null>(null);

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = this._user.asReadonly();

  constructor(private http: HttpClient) {
    if (this._token()) {
      this.loadUser();
    }
  }

  login(dto: LoginDto): Observable<ApiResponse<AuthResponseDto>> {
    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.apiUrl}/login`, dto).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('auth_token', res.data.token);
          this._token.set(res.data.token);
          this._user.set({
            id: '',
            username: res.data.username,
            email: res.data.email,
            firstName: '',
            lastName: '',
            isAdmin: false,
            requiresPasswordChange: res.data.requiresPasswordChange,
          });
        }
      })
    );
  }

  loadUser(): void {
    this.http.get<ApiResponse<UserDto>>(`${this.apiUrl}/me`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this._user.set(res.data);
        }
      },
      error: () => this.logout(),
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this._token.set(null);
    this._user.set(null);
  }

  getToken(): string | null {
    return this._token();
  }
}
