import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { server } from './global';

@Injectable({
  providedIn: 'root'
})
export class EntrenadorService {
  private urlAPI: string;

  constructor(private http: HttpClient) {
    this.urlAPI = server.url + 'entrenador/';
  }

  getEntrenadores(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.get(this.urlAPI, { headers });
  }

  getEntrenador(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.get(this.urlAPI + id, { headers });
  }

  storeEntrenador(entrenador: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.post(this.urlAPI, { data: entrenador }, { headers });
  }

  updateEntrenador(id: number, entrenador: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.put(this.urlAPI + id, { data: entrenador }, { headers });
  }

  deleteEntrenador(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.delete(this.urlAPI + id, { headers });
  }
}
