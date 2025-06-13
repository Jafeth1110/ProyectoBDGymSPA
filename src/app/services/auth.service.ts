import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/v1';
  private identitySubject = new BehaviorSubject<any>(null);
  private jwtHelper = new JwtHelperService();
  
  public currentIdentity = this.identitySubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeIdentity();
  }

  private initializeIdentity(): void {
    const token = this.getToken();
    const identity = this.getIdentity();

    if (token && !this.isTokenExpired(token) && identity) {
      this.identitySubject.next(identity);
    } else {
      this.clearSession();
    }
  }

  login(email: string, password: string): Observable<any> {
    const payload = {
      data: {
        email,
        password
      }
    };

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/user/login`, payload, { headers }).pipe(
      tap((response: any) => {
        if (response?.data?.token) {
          this.getIdentityFromApi(response.data.token).subscribe(identity => {
            this.saveSession(response.data.token, identity.data);
          });
        }
      })
    );
  }

  getIdentityFromApi(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/user/getidentity`, { headers }).pipe(
      catchError(error => {
        this.clearSession();
        return of(null);
      })
    );
  }

  saveSession(token: string, identity: any): void {
    localStorage.setItem('session_active', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('identity', JSON.stringify(identity));
    localStorage.setItem('token_expiration', (Date.now() + 3600000).toString());
    this.identitySubject.next(identity);
  }

  checkStaleSession(): void {
    const wasActive = localStorage.getItem('session_active') === 'true';
    const nowActive = this.isAuthenticated();
    
    // Si había una sesión activa pero ahora no está autenticado
    if (wasActive && !nowActive) {
      this.clearSession();
    }
    
    // Actualizamos el estado de la sesión
    if (nowActive) {
      localStorage.setItem('session_active', 'true');
    } else {
      localStorage.removeItem('session_active');
    }
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return this.http.post(`${this.baseUrl}/user/logout`, {}, { headers }).pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(error => {
          this.clearSession();
          return of(null);
        })
      );
    }
    this.clearSession();
    return of(null);
  }

  public clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('identity');
    localStorage.removeItem('token_expiration');
    this.identitySubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getIdentity(): any | null {
    const identity = localStorage.getItem('identity');
    return identity ? JSON.parse(identity) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      return true;
    }
  }

  refreshIdentity(): void {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        this.getIdentityFromApi(token).subscribe();
      }
    } else {
      this.clearSession();
    }
  }
}