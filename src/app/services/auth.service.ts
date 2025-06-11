import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/v1'; // sin /v1 si no lo usas

  constructor(private http: HttpClient) {}

 login(email: string, password: string): Observable<any> {
    // Estructura exacta que espera el backend
    const payload = {
      data: {
        email: email,
        password: password
      }
    };

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/user/login`, payload, { headers });
  }

  /**
   * Guarda el token y la identidad del usuario en sessionStorage.
   */
  saveSession(token: string, identity: any): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('identity', JSON.stringify(identity));
  }

  /**
   * Limpia toda la sesión actual.
   */
  logout(): void {
    sessionStorage.clear();
  }

  /**
   * Retorna el token almacenado en sesión.
   */
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /**
   * Retorna la identidad del usuario como objeto o null si no existe.
   */
  getIdentity(): any | null {
    const identity = sessionStorage.getItem('identity');
    return identity ? JSON.parse(identity) : null;
  }

  /**
   * Retorna true si hay un token válido almacenado.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
