import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { MetodoPago } from "../models/metodoPago";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  MetodoPagoResponse, 
  MetodoPagoFormData 
} from "../models/api-interfaces";
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'metodospago/';
  }

  /**
   * Obtiene todos los métodos de pago
   */
  getMetodosPago(): Observable<ApiResponse<MetodoPagoResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MetodoPagoResponse[]>>(this.urlAPI, { headers });
  }

  /**
   * Obtiene un método de pago específico por ID
   */
  getMetodoPago(id: number): Observable<ApiResponse<MetodoPagoResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MetodoPagoResponse>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Crea un nuevo método de pago
   */
  addMetodoPago(metodoPagoData: MetodoPagoFormData): Observable<ApiResponse<MetodoPagoResponse>> {
    // Validaciones
    const validation = this.validateMetodoPagoData(metodoPagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify({ data: metodoPagoData });
    return this._http.post<ApiResponse<MetodoPagoResponse>>(this.urlAPI, params, { headers });
  }

  /**
   * Actualiza un método de pago existente
   */
  updateMetodoPago(id: number, metodoPagoData: MetodoPagoFormData): Observable<ApiResponse<MetodoPagoResponse>> {
    // Validaciones
    const validation = this.validateMetodoPagoData(metodoPagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify({ data: metodoPagoData });
    return this._http.put<ApiResponse<MetodoPagoResponse>>(`${this.urlAPI}${id}`, params, { headers });
  }

  /**
   * Elimina un método de pago
   */
  deleteMetodoPago(id: number): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Valida los datos de un método de pago
   */
  private validateMetodoPagoData(metodoPagoData: MetodoPagoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!metodoPagoData.nombre || metodoPagoData.nombre.trim().length === 0) {
      errors.push('El nombre del método de pago es obligatorio');
    } else if (metodoPagoData.nombre.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    } else if (metodoPagoData.nombre.trim().length > 45) {
      errors.push('El nombre no puede exceder 45 caracteres');
    }

    // Validar descripción
    if (metodoPagoData.descripcion && metodoPagoData.descripcion.trim().length > 100) {
      errors.push('La descripción no puede exceder 100 caracteres');
    }

    // Validar estado
    if (metodoPagoData.estado !== 0 && metodoPagoData.estado !== 1) {
      errors.push('El estado debe ser 0 (Inactivo) o 1 (Activo)');
    }

    // Validar requiere autorización
    if (metodoPagoData.requiereAutorizacion !== 0 && metodoPagoData.requiereAutorizacion !== 1) {
      errors.push('Requiere autorización debe ser 0 (No) o 1 (Sí)');
    }

    // Validar comisión
    if (metodoPagoData.comision < 0) {
      errors.push('La comisión no puede ser negativa');
    } else if (metodoPagoData.comision > 100) {
      errors.push('La comisión no puede exceder 100%');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la respuesta de la API a modelo local
   */
  mapResponseToModel(response: MetodoPagoResponse): MetodoPago {
    return new MetodoPago(
      Number(response.idMetodoPago),
      response.nombre,
      response.descripcion,
      Number(response.estado), // Conversión explícita a número
      Number(response.requiereAutorizacion), // Conversión explícita a número
      Number(response.comision)
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(metodoPago: MetodoPago): MetodoPagoFormData {
    return {
      nombre: metodoPago.nombre,
      descripcion: metodoPago.descripcion,
      estado: metodoPago.estado,
      requiereAutorizacion: metodoPago.requiereAutorizacion,
      comision: metodoPago.comision
    };
  }
}