import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StadiumImage } from '../models/stadium-image.model';

@Injectable({ providedIn: 'root' })
export class StadiumImageService {
  private http = inject(HttpClient);
  private base = (stadiumId: number) => `${environment.apiUrl}/stadiums/${stadiumId}/images`;

  getImages(stadiumId: number): Observable<StadiumImage[]> {
    return this.http.get<StadiumImage[]>(this.base(stadiumId));
  }

  uploadImages(stadiumId: number, files: File[]): Observable<StadiumImage[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<StadiumImage[]>(this.base(stadiumId), formData);
  }

  setPrimary(stadiumId: number, imageId: number): Observable<StadiumImage> {
    return this.http.put<StadiumImage>(`${this.base(stadiumId)}/${imageId}/primary`, {});
  }

  deleteImage(stadiumId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(stadiumId)}/${imageId}`);
  }
}