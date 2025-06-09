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

  login(user: User): Observable<any> {
    let userJson = JSON.stringify(user);
    let params = 'data=' + userJson;
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let options = { headers };
    return this._http.post(this.urlAPI + 'user/login', params, options);
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
 store(user: User): Observable<any> {
    // En lugar de armar 'data=' + JSON.stringify(user), enviamos body JSON.
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.urlAPI + 'add', user, { headers });
  }

  getUsers(): Observable<any> {
    return this._http.get(this.urlAPI + 'getUsers');
  }

  deleteUser(idUsuario: number): Observable<any> {
    return this._http.delete(this.urlAPI + 'deleteUser/' + idUsuario);
  }

  // Si quieres buscar por ID:
  showById(idUsuario: number): Observable<any> {
    return this._http.get(this.urlAPI + 'getUser/' + idUsuario);
  }

}
