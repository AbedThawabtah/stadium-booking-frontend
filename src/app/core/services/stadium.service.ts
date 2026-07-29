import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, Stadium, StadiumSearchParams } from '../models/stadium.model';

@Injectable({ providedIn: 'root' })
export class StadiumService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stadiums`;

  search(params: StadiumSearchParams): Observable<PageResponse<Stadium>> {
  let httpParams = new HttpParams();

  const keyword = params.keyword?.trim();
  const city = params.city?.trim();
  const sportType = params.sportType?.trim();

  if (keyword) httpParams = httpParams.set('keyword', keyword);
  if (city) httpParams = httpParams.set('city', city);
  if (sportType) httpParams = httpParams.set('sportType', sportType);
  if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice);
  if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice);
  if (params.date) httpParams = httpParams.set('date', params.date);
  if (params.sort) httpParams = httpParams.set('sort', params.sort);

  httpParams = httpParams.set('page', params.page ?? 0);
  httpParams = httpParams.set('size', params.size ?? 9);

  return this.http.get<PageResponse<Stadium>>(this.apiUrl, { params: httpParams });
}

  getById(id: number): Observable<Stadium> {
    return this.http.get<Stadium>(`${this.apiUrl}/${id}`);
  }
}