import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { server } from './global';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlAPI: string;

  constructor(private http: HttpClient) {
    this.urlAPI = server.url + 'cliente/';
  }

  getClientes(): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.get(this.urlAPI, { headers });
  }

  getCliente(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.get(this.urlAPI + id, { headers });
  }

  storeCliente(cliente: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.post(this.urlAPI, { data: cliente }, { headers });
  }

  updateCliente(id: number, cliente: any): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.put(this.urlAPI + id, { data: cliente }, { headers });
  }

  deleteCliente(id: number): Observable<any> {
    const bearerToken = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${bearerToken}`
    });
    return this.http.delete(this.urlAPI + id, { headers });
  }
}
