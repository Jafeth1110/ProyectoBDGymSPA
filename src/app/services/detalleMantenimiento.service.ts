import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { DetalleMantenimiento } from '../models/detalleMantenimiento';

@Injectable({
  providedIn: 'root'
})
export class DetalleMantenimientoService {
  private urlAPI = server.url + 'detallemantenimiento/';

  constructor(private _http: HttpClient) {}

  getDetalles(): Observable<any> {
    return this._http.get(this.urlAPI);
  }

  storeDetalle(detalle: DetalleMantenimiento): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.urlAPI, { data: detalle }, { headers });
  }

  showDetalle(id: number): Observable<any> {
    return this._http.get(this.urlAPI + id);
  }

  updateDetalle(id: number, body: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  deleteDetalle(id: number): Observable<any> {
    return this._http.delete(this.urlAPI + id);
  }
}