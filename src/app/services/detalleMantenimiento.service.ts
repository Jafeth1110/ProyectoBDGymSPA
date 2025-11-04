import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DetalleMantenimiento } from '../models/detalleMantenimiento';

@Injectable({
  providedIn: 'root'
})
export class DetalleMantenimientoService {
  private urlAPI = server.url + 'detallemantenimiento/';

  constructor(private _http: HttpClient) {}

  getDetalles(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI, { headers }).pipe(
      map((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          response.data = response.data.map((item: any) => this.mapToDetalleMantenimiento(item));
        }
        return response;
      })
    );
  }

  /**
   * Mapea un objeto plano a una instancia de DetalleMantenimiento
   */
  private mapToDetalleMantenimiento(data: any): DetalleMantenimiento {
    // Convertir pagado de string/number a boolean
    const pagado = data.pagado === true || 
                   data.pagado === 1 || 
                   data.pagado === '1' || 
                   String(data.pagado).toLowerCase() === 'true';
    
    return new DetalleMantenimiento(
      data.idDetalleMantenimiento || 0,
      data.idAdmin || 0,
      data.idEquipo || 0,
      data.idMantenimiento || 0,
      data.fechaMantenimiento || '',
      pagado,
      data.fechaPago || '',
      data.estado_pago
    );
  }

  storeDetalle(detalle: DetalleMantenimiento): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.post(this.urlAPI, { data: detalle }, { headers });
  }

  showDetalle(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.get(this.urlAPI + id, { headers }).pipe(
      map((response: any) => {
        if (response && response.detalle) {
          response.detalle = this.mapToDetalleMantenimiento(response.detalle);
        }
        return response;
      })
    );
  }

  updateDetalle(id: number, body: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  deleteDetalle(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this._http.delete(this.urlAPI + id, { headers });
  }
}