import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Admin } from '../models/admin';
import { server } from './global';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private urlAPI: string;

  constructor(private http: HttpClient) {
    this.urlAPI = server.url + 'admin/';
  }

  getAdmins(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    
    console.log('Llamando a:', this.urlAPI); // Para debugging
    return this.http.get(this.urlAPI, { headers }).pipe(
      tap(response => console.log('Respuesta raw de admins:', response)),
      catchError(error => {
        console.error('Error en AdminService.getAdmins():', error);
        // Retornar estructura vacía pero válida en caso de error
        return of({ status: 200, data: [] });
      })
    );
  }

  getAdmin(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.get(this.urlAPI + id, { headers });
  }

  storeAdmin(admin: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.post(this.urlAPI, { data: admin }, { headers });
  }

  updateAdmin(id: number, admin: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.put(this.urlAPI + id, { data: admin }, { headers });
  }

  deleteAdmin(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.delete(this.urlAPI + id, { headers });
  }
}
