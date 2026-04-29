import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../enviroments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private baseUrl = 'http://localhost:5000/api/auth'
  private baseUrl = `${environment.apiUrl}/auth`;
  // 'https://e-commerce-back-end-khaki-two.vercel.app/api/auth';

  constructor(private http: HttpClient) {}
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }
  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      headers: { Authorization: `${token}` }
    }).pipe(
      tap({
        next: () => localStorage.removeItem('token'),
        error: () => localStorage.removeItem('token'),
        complete: () => localStorage.removeItem('token')
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}