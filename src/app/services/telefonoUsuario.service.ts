import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { TelefonoUsuario } from '../models/telefonoUsuario';

@Injectable({
  providedIn: 'root'
})
export class TelefonoUsuarioService {
  private urlAPI = server.url + 'telefonousuario/';

  constructor(private _http: HttpClient) {}

  getTelefonos(): Observable<any> {
    return this._http.get(this.urlAPI);
  }

  storeTelefono(telefono: TelefonoUsuario): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.urlAPI, { data: telefono }, { headers });
  }

  showTelefono(id: number): Observable<any> {
    return this._http.get(this.urlAPI + id);
  }

  updateTelefono(id: number, body: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(this.urlAPI + id, { data: body }, { headers });
  }

  deleteTelefono(id: number): Observable<any> {
    return this._http.delete(this.urlAPI + id);
  }
}