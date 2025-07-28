import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { server } from './global';
import { Observable } from 'rxjs';
import { TelefonoService } from './telefono.service';

/**
 * Servicio de compatibilidad para TelefonoUsuario
 * Redirige las llamadas al nuevo TelefonoService unificado
 * @deprecated Use TelefonoService instead
 */
@Injectable({
  providedIn: 'root'
})
export class TelefonoUsuarioService {
  constructor(
    private http: HttpClient,
    private telefonoService: TelefonoService
  ) { }

  /**
   * @deprecated Use telefonoService.getAllTelefonos() instead
   */
  getTelefonos(): Observable<any> {
    return this.telefonoService.getAllTelefonos();
  }

  /**
   * @deprecated Use telefonoService.getUserTelefonos() instead
   */
  getUserTelefonos(email: string): Observable<any> {
    return this.telefonoService.getUserTelefonos(email);
  }

  /**
   * @deprecated Use telefonoService.getTelefono() instead
   */
  showTelefono(id: number): Observable<any> {
    return this.telefonoService.getTelefono(id);
  }

  /**
   * @deprecated Use telefonoService.addTelefonoToUser() instead
   */
  storeTelefono(email: string, telefono: { telefono: string; tipoTel: string }): Observable<any> {
    // For compatibility, use the simplified interface without idUsuario
    // The service will handle user identification via email
    return this.telefonoService.addTelefonoToUser(email, {
      telefono: telefono.telefono,
      tipoTel: telefono.tipoTel as 'celular' | 'casa' | 'trabajo'
    });
  }

  /**
   * @deprecated Use telefonoService.updateTelefono() instead
   */
  updateTelefono(id: number, telefono: { telefono: string; tipoTel: string }): Observable<any> {
    // For compatibility, use the simplified interface without idUsuario
    return this.telefonoService.updateTelefono(id, {
      telefono: telefono.telefono,
      tipoTel: telefono.tipoTel as 'celular' | 'casa' | 'trabajo'
    });
  }

  /**
   * @deprecated Use telefonoService.deleteTelefono() instead
   */
  deleteTelefono(id: number): Observable<any> {
    return this.telefonoService.deleteTelefono(id);
  }

  /**
   * @deprecated Use telefonoService.updateUserTelefonos() instead
   */
  updateUserTelefonos(email: string, telefonos: Array<{ telefono: string; tipoTel: string }>): Observable<any> {
    // For compatibility, use the simplified interface without idUsuario
    const telefonosRequest = telefonos.map(tel => ({
      telefono: tel.telefono,
      tipoTel: tel.tipoTel as 'celular' | 'casa' | 'trabajo'
    }));
    return this.telefonoService.updateUserTelefonos(email, telefonosRequest);
  }

  /**
   * @deprecated Use telefonoService.clearUserTelefonos() instead
   */
  clearUserTelefonos(email: string): Observable<any> {
    return this.telefonoService.clearUserTelefonos(email);
  }
}