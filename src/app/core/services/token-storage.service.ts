import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  saveAuth(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role
    }));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  getUser(): { userId: number; fullName: string; email: string; role: string } | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
}