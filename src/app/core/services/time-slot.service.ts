import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimeSlot, GenerateTimeSlotsRequest, GenerateTimeSlotsRangeRequest } from '../models/time-slot.model';

@Injectable({ providedIn: 'root' })
export class TimeSlotService {
  private http = inject(HttpClient);
  private base = (stadiumId: number) => `${environment.apiUrl}/stadiums/${stadiumId}/time-slots`;

  getAvailableSlots(stadiumId: number, date: string): Observable<TimeSlot[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TimeSlot[]>(this.base(stadiumId), { params });
  }

  generate(stadiumId: number, request: GenerateTimeSlotsRequest): Observable<TimeSlot[]> {
    return this.http.post<TimeSlot[]>(`${this.base(stadiumId)}/generate`, request);
  }

  generateRange(stadiumId: number, request: GenerateTimeSlotsRangeRequest): Observable<TimeSlot[]> {
    return this.http.post<TimeSlot[]>(`${this.base(stadiumId)}/generate-range`, request);
  }
}