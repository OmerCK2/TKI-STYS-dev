export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  expiration: string;
  username: string;
  email: string;
  isAdmin: boolean;
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

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AdminCreateUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}
