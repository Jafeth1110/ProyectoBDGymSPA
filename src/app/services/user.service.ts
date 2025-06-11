import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { User } from "../models/user";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
   private urlAPI: string;

  constructor(private _http: HttpClient) {
    this.urlAPI = server.url + 'user/';
  }

 login(email: string, password: string): Observable<any> {
    const data = { email, password };
    const params = new URLSearchParams();
    params.set('data', JSON.stringify(data));
    
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    return this._http.post(`${this.urlAPI}user/login`, params.toString(), { headers });
  }

  getIdentityFromAPI(): Observable<any> {
    let headers;
    let bearerToken = sessionStorage.getItem('token');
    if (bearerToken) {
      headers = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('bearertoken', bearerToken);
    } else {
      headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    }
    let options = { headers };
    return this._http.get(this.urlAPI + 'user/getidentity', options);
  }
 storeUser(user: User): Observable<any> {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  // Enviamos el usuario dentro de un objeto "data"
  return this._http.post(this.urlAPI + 'add', { data: user }, { headers });
}

  getUsers(): Observable<any> {
    return this._http.get(this.urlAPI + 'getUsers');
  }

  deleteUser(email: string): Observable<any> {
    return this._http.delete(this.urlAPI + 'destroyUser/' + email);
  }

  // Si quieres buscar por ID:
  showUser(email: string): Observable<any> {
    return this._http.get(this.urlAPI + 'getUser/' + email);
  }

  updateUser(email: string, body: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(this.urlAPI + 'updateUser/' + email, body, { headers });
  }
}
