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
    return this._http.get(this.urlAPI);
  }

  storeMantenimiento(mantenimiento: Mantenimiento): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.urlAPI, { data: mantenimiento }, { headers });
  }

  showMantenimiento(id: number): Observable<any> {
    return this._http.get(this.urlAPI + id);
  }

  updateMantenimiento(id: number, body: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  deleteMantenimiento(id: number): Observable<any> {
    return this._http.delete(this.urlAPI + id);
  }
}