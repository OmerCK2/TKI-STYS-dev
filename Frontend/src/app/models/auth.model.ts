export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  expiration: string;
  username: string;
  email: string;
  requiresPasswordChange: boolean;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  requiresPasswordChange: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}
