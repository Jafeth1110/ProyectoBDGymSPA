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
    return this._http.get(this.urlAPI);
  }

  storeEquipo(equipo: Equipo): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.urlAPI, { data: equipo }, { headers });
  }

  showEquipo(id: number): Observable<any> {
    return this._http.get(this.urlAPI + id);
  }

  updateEquipo(id: number, body: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  // Si tu backend acepta cantidad como parámetro en el body para eliminar parcial:
  deleteEquipo(id: number, cantidad?: number): Observable<any> {
    if (cantidad !== undefined) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.request('delete', this.urlAPI + id, { body: { cantidad }, headers });
    }
    return this._http.delete(this.urlAPI + id);
  }
}