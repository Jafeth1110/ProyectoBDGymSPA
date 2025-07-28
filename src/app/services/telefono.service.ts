import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { server } from './global';
import { Telefono, TelefonoRequest, TelefonoResponse } from '../models/telefono';

@Injectable({
  providedIn: 'root'
})
export class TelefonoService {
  private baseUrl = server.url + 'telefonos';
  private userUrl = server.url + 'user';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los teléfonos del sistema
   */
  getAllTelefonos(): Observable<TelefonoResponse> {
    return this.http.get<TelefonoResponse>(this.baseUrl);
  }

  /**
   * Obtener un teléfono específico por ID
   */
  getTelefono(id: number): Observable<TelefonoResponse> {
    return this.http.get<TelefonoResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear un nuevo teléfono
   */
  createTelefono(telefono: TelefonoRequest): Observable<TelefonoResponse> {
    const payload = { data: telefono };
    return this.http.post<TelefonoResponse>(this.baseUrl, payload);
  }

  /**
   * Actualizar un teléfono existente
   */
  updateTelefono(id: number, telefono: Partial<TelefonoRequest>): Observable<TelefonoResponse> {
    const payload = { data: telefono };
    return this.http.put<TelefonoResponse>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Eliminar un teléfono
   */
  deleteTelefono(id: number): Observable<TelefonoResponse> {
    return this.http.delete<TelefonoResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener teléfonos de un usuario específico
   */
  getTelefonosByUser(userId: number): Observable<TelefonoResponse> {
    return this.http.get<TelefonoResponse>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Obtener teléfonos por rol
   */
  getTelefonosByRole(rolId: number): Observable<TelefonoResponse> {
    return this.http.get<TelefonoResponse>(`${this.baseUrl}/role/${rolId}`);
  }

  /**
   * Métodos de compatibilidad con UserController para teléfonos
   */

  /**
   * Agregar teléfono a un usuario (usando UserController)
   */
  addTelefonoToUser(email: string, telefono: { telefono: string; tipoTel: string }): Observable<any> {
    const payload = { data: telefono };
    return this.http.post(`${this.userUrl}/${email}/telefono`, payload);
  }

  /**
   * Obtener teléfonos de un usuario por email (usando UserController)
   */
  getUserTelefonos(email: string): Observable<any> {
    return this.http.get(`${this.userUrl}/${email}/telefonos`);
  }

  /**
   * Actualizar todos los teléfonos de un usuario (usando UserController)
   */
  updateUserTelefonos(email: string, telefonos: Array<{ telefono: string; tipoTel: string }>): Observable<any> {
    const payload = { data: { telefonos } };
    return this.http.put(`${this.userUrl}/${email}/telefonos`, payload);
  }

  /**
   * Limpiar todos los teléfonos de un usuario (usando UserController)
   */
  clearUserTelefonos(email: string): Observable<any> {
    return this.http.delete(`${this.userUrl}/${email}/telefonos`);
  }

  /**
   * Validar datos de teléfono
   */
  validateTelefono(telefono: string): boolean {
    const telefonoRegex = /^\d{8,12}$/;
    return telefonoRegex.test(telefono);
  }

  /**
   * Validar tipo de teléfono
   */
  validateTipoTelefono(tipoTel: string): boolean {
    return ['celular', 'casa', 'trabajo'].includes(tipoTel);
  }
}
