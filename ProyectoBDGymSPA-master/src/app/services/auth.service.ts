import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/v1'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/login`, {
      data: { email, password }
    });
  }

  saveSession(token: string, identity: any): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('identity', JSON.stringify(identity));
  }

  logout(): void {
    sessionStorage.clear();
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getIdentity(): any | null {
    const identity = sessionStorage.getItem('identity');
    return identity ? JSON.parse(identity) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
