import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { Mantenimiento } from '../models/mantenimiento';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private urlAPI = server.url + 'mantenimiento/';

  constructor(private _http: HttpClient) {}

  getMantenimientos(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI, { headers });
  }

  storeMantenimiento(mantenimiento: Mantenimiento): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.post(this.urlAPI, { data: mantenimiento }, { headers });
  }

  showMantenimiento(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI + id, { headers });
  }

  updateMantenimiento(id: number, body: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  deleteMantenimiento(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.delete(this.urlAPI + id, { headers });
  }
}