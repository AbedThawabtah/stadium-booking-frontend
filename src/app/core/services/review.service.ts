import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);

  getStadiumReviews(stadiumId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${environment.apiUrl}/stadiums/${stadiumId}/reviews`);
  }
}