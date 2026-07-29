export type UserRole = 'CUSTOMER' | 'STADIUM_OWNER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: 'CUSTOMER' | 'STADIUM_OWNER'; // ADMIN ممنوع من التسجيل العام
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}