import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
}

export interface UserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsersAdminApiService {
  private apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) {}

  findAll(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.apiUrl);
  }

  create(request: UserRequest): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.apiUrl, request);
  }

  update(id: number, request: UserRequest): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  resetPassword(id: number, password: string): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/${id}/reset-password`, { password });
  }
}
