import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, UserSummary, ActivityLog } from '../models/admin.model';
import { Stadium } from '../models/stadium.model';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }

  // ── الملاعب ──
  getPendingStadiums(): Observable<Stadium[]> {
    return this.http.get<Stadium[]>(`${this.base}/stadiums/pending`);
  }

  approveStadium(id: number): Observable<Stadium> {
    return this.http.put<Stadium>(`${this.base}/stadiums/${id}/approve`, {});
  }

  suspendStadium(id: number): Observable<Stadium> {
    return this.http.put<Stadium>(`${this.base}/stadiums/${id}/suspend`, {});
  }

  reactivateStadium(id: number): Observable<Stadium> {
    return this.http.put<Stadium>(`${this.base}/stadiums/${id}/reactivate`, {});
  }

  // ── المستخدمين ──
  getAllUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.base}/users`);
  }

  toggleUserStatus(id: number): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.base}/users/${id}/toggle-status`, {});
  }

  // ── مراجعة التقييمات ──
  getPendingReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/reviews/pending`);
  }

  approveReview(id: number): Observable<Review> {
    return this.http.put<Review>(`${this.base}/reviews/${id}/approve`, {});
  }

  rejectReview(id: number, reason?: string): Observable<Review> {
    return this.http.put<Review>(`${this.base}/reviews/${id}/reject`, { reason });
  }

  // ── سجل النشاطات ──
  getAllActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.base}/activity-logs`);
  }
}