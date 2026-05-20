import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, RegisterRequest } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'vehicle_fleet_token';
  private userKey = 'vehicle_fleet_user';

  constructor(private http: HttpClient) {}

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.saveSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap((response) => this.saveSession(response)));
  }

  refreshCurrentUser(): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/me`)
      .pipe(tap((response) => this.saveUser(response)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAdmin(): boolean {
    return this.normalizeRole(this.getCurrentUser()?.role) === 'ADMIN';
  }

  private saveSession(response: AuthResponse) {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
    }

    this.saveUser(response);
  }

  private saveUser(response: AuthResponse) {
    localStorage.setItem(this.userKey, JSON.stringify({
      ...response,
      role: this.normalizeRole(response.role),
    }));
  }

  private normalizeRole(role?: string): string {
    return (role || 'USER').replace('ROLE_', '').trim().toUpperCase();
  }
}
