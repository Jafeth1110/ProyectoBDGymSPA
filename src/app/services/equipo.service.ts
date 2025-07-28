import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { Equipo } from '../models/equipo';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private urlAPI = server.url + 'equipo/';

  constructor(private _http: HttpClient) {}

  getEquipos(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI, { headers });
  }

  storeEquipo(equipo: Equipo): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.post(this.urlAPI, { data: equipo }, { headers });
  }

  showEquipo(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI + id, { headers });
  }

  updateEquipo(id: number, body: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  // Si tu backend acepta cantidad como parámetro en el body para eliminar parcial:
  deleteEquipo(id: number, cantidad?: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    if (cantidad !== undefined) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`
      });
      return this._http.request('delete', this.urlAPI + id, { body: { cantidad }, headers });
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.delete(this.urlAPI + id, { headers });
  }
}