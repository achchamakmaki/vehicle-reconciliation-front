import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComparisonResult {
  id: number;
  matricule: string;
  status: string;
  details: string;
}

export interface DashboardStats {
  totalNarsaVehicles: number;
  totalSageVehicles: number;
  matchCount: number;
  absentInSageCount: number;
  absentInNarsaCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleReconciliation {
  private apiUrl = 'http://localhost:8080/api/narsa';

  constructor(private http: HttpClient) {}

  uploadNarsa(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' });
  }

  uploadSage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/sage/upload`, formData, { responseType: 'text' });
  }

  compare(): Observable<string> {
    return this.http.post(`${this.apiUrl}/compare`, null, { responseType: 'text' });
  }

  getResults(): Observable<ComparisonResult[]> {
    return this.http.get<ComparisonResult[]>(`${this.apiUrl}/results`);
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  exportResults(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/results/export`, {
      responseType: 'blob',
    });
  }

  resetData(): Observable<string> {
    return this.http.delete(`${this.apiUrl}/reset`, {
      responseType: 'text',
    });
  }
}
