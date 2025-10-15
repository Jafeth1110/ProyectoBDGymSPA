import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { Membresia } from "../models/membresia";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  MembresiaResponse, 
  MembresiaFormData 
} from "../models/api-interfaces";
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'membresias/';
  }

  /**
   * Obtiene todas las membresías
   */
  getMembresias(): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(this.urlAPI, { headers });
  }

  /**
   * Obtiene una membresía específica por ID
   */
  getMembresia(id: number): Observable<ApiResponse<MembresiaResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Crea una nueva membresía
   */
  addMembresia(membresiaData: MembresiaFormData): Observable<ApiResponse<MembresiaResponse>> {
    // Validaciones
    const validation = this.validateMembresiaData(membresiaData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(membresiaData);
    return this._http.post<ApiResponse<MembresiaResponse>>(this.urlAPI, params, { headers });
  }

  /**
   * Actualiza una membresía existente
   */
  updateMembresia(id: number, membresiaData: MembresiaFormData): Observable<ApiResponse<MembresiaResponse>> {
    // Validaciones
    const validation = this.validateMembresiaData(membresiaData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(membresiaData);
    return this._http.put<ApiResponse<MembresiaResponse>>(`${this.urlAPI}${id}`, params, { headers });
  }

  /**
   * Elimina una membresía
   */
  deleteMembresia(id: number): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Valida los datos de una membresía
   */
  private validateMembresiaData(membresiaData: MembresiaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar tipo
    if (!membresiaData.tipo || membresiaData.tipo.trim().length === 0) {
      errors.push('El tipo de membresía es obligatorio');
    } else if (membresiaData.tipo.trim().length < 3) {
      errors.push('El tipo de membresía debe tener al menos 3 caracteres');
    } else if (membresiaData.tipo.trim().length > 50) {
      errors.push('El tipo de membresía no puede exceder 50 caracteres');
    }

    // Validar precio
    if (!membresiaData.precio || membresiaData.precio <= 0) {
      errors.push('El precio debe ser mayor a 0');
    } else if (membresiaData.precio > 1000000) {
      errors.push('El precio no puede exceder ₡1,000,000');
    }

    // Validar duración
    if (!membresiaData.duracionMeses || membresiaData.duracionMeses <= 0) {
      errors.push('La duración debe ser mayor a 0 meses');
    } else if (membresiaData.duracionMeses > 36) {
      errors.push('La duración no puede exceder 36 meses');
    }

    // Validar descripción
    if (!membresiaData.descripcion || membresiaData.descripcion.trim().length === 0) {
      errors.push('La descripción es obligatoria');
    } else if (membresiaData.descripcion.trim().length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    // Validar estado
    if (membresiaData.estado !== 0 && membresiaData.estado !== 1) {
      errors.push('El estado debe ser 0 (Inactiva) o 1 (Activa)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la respuesta de la API a modelo local
   */
  mapResponseToModel(response: MembresiaResponse): Membresia {
    return new Membresia(
      response.idMembresia,
      response.tipo,
      response.precio,
      response.duracionMeses,
      response.descripcion,
      response.estado,
      response.beneficios
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(membresia: Membresia): MembresiaFormData {
    return {
      tipo: membresia.tipo,
      precio: membresia.precio,
      duracionMeses: membresia.duracionMeses,
      descripcion: membresia.descripcion,
      estado: membresia.estado,
      beneficios: membresia.beneficios
    };
  }
}