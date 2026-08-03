import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkingHour, WorkingHourRequest } from '../models/working-hour.model';

@Injectable({ providedIn: 'root' })
export class WorkingHourService {
  private http = inject(HttpClient);

  getWorkingHours(stadiumId: number): Observable<WorkingHour[]> {
    return this.http.get<WorkingHour[]>(`${environment.apiUrl}/stadiums/${stadiumId}/working-hours`);
  }

  setWorkingHours(stadiumId: number, requests: WorkingHourRequest[]): Observable<WorkingHour[]> {
    return this.http.put<WorkingHour[]>(`${environment.apiUrl}/stadiums/${stadiumId}/working-hours`, requests);
  }
}