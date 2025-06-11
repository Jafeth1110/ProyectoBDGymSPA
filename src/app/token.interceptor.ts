import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtén el token almacenado en localStorage (puedes cambiar a sessionStorage si prefieres)
    const token = localStorage.getItem('token');

    if (token) {
      // Clona la petición y añade el header Authorization con el token
      const clonedRequest = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + token)
      });
      return next.handle(clonedRequest);
    } else {
      // Si no hay token, envía la petición normal
      return next.handle(request);
    }
  }
}
