import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginDto, AuthResponseDto, UserDto, ApiResponse, ChangePasswordDto, AdminCreateUserDto } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  private readonly _token = signal<string | null>(localStorage.getItem('auth_token'));
  private readonly _user = signal<UserDto | null>(null);

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = this._user.asReadonly();
  readonly isAdmin = computed(() => this._user()?.isAdmin === true);
  readonly requiresPasswordChange = computed(() => this._user()?.requiresPasswordChange === true);

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
            isAdmin: res.data.isAdmin,
            requiresPasswordChange: res.data.requiresPasswordChange,
          });
          this.loadUser();
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

  changePassword(dto: ChangePasswordDto): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/change-password`, dto).pipe(
      tap((res) => {
        if (res.success) {
          const user = this._user();
          if (user) {
            this._user.set({ ...user, requiresPasswordChange: false });
          }
        }
      })
    );
  }

  createUser(dto: AdminCreateUserDto): Observable<ApiResponse<UserDto>> {
    return this.http.post<ApiResponse<UserDto>>(`${this.apiUrl}/create-user`, dto);
  }

  getAllUsers(): Observable<ApiResponse<UserDto[]>> {
    return this.http.get<ApiResponse<UserDto[]>>(`${this.apiUrl}/users`);
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
