import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { InscripcionClase } from "../models/inscripcionClase";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  InscripcionClaseResponse, 
  InscripcionClaseFormData 
} from "../models/api-interfaces";
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class InscripcionClaseService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'inscripcionclase/';
  }

  /**
   * Obtiene todas las inscripciones a clases
   */
  getInscripciones(): Observable<ApiResponse<InscripcionClaseResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<InscripcionClaseResponse[]>>(this.urlAPI, { headers });
  }

  /**
   * Obtiene una inscripción específica por ID
   */
  getInscripcion(id: number): Observable<ApiResponse<InscripcionClaseResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<InscripcionClaseResponse>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Crea una nueva inscripción a clase
   */
  addInscripcion(inscripcionData: InscripcionClaseFormData): Observable<ApiResponse<InscripcionClaseResponse>> {
    // Validaciones
    const validation = this.validateInscripcionData(inscripcionData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(inscripcionData);
    return this._http.post<ApiResponse<InscripcionClaseResponse>>(this.urlAPI, params, { headers });
  }

  /**
   * Actualiza una inscripción existente
   */
  updateInscripcion(id: number, inscripcionData: InscripcionClaseFormData): Observable<ApiResponse<InscripcionClaseResponse>> {
    // Validaciones
    const validation = this.validateInscripcionData(inscripcionData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(inscripcionData);
    return this._http.put<ApiResponse<InscripcionClaseResponse>>(`${this.urlAPI}${id}`, params, { headers });
  }

  /**
   * Elimina una inscripción
   */
  deleteInscripcion(id: number): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Valida los datos de una inscripción
   */
  private validateInscripcionData(inscripcionData: InscripcionClaseFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar cliente
    if (!inscripcionData.idCliente || inscripcionData.idCliente <= 0) {
      errors.push('Debe seleccionar un cliente válido');
    }

    // Validar entrenador
    if (!inscripcionData.idEntrenador || inscripcionData.idEntrenador <= 0) {
      errors.push('Debe seleccionar un entrenador válido');
    }

    // Validar clase
    if (!inscripcionData.idClase || inscripcionData.idClase <= 0) {
      errors.push('Debe seleccionar una clase válida');
    }

    // Validar fecha de inscripción
    if (!inscripcionData.fechaInscripcion || inscripcionData.fechaInscripcion.trim().length === 0) {
      errors.push('La fecha de inscripción es obligatoria');
    } else {
      const fechaInscripcion = new Date(inscripcionData.fechaInscripcion);
      const hoy = new Date();
      
      if (isNaN(fechaInscripcion.getTime())) {
        errors.push('La fecha de inscripción no es válida');
      } else if (fechaInscripcion > hoy) {
        errors.push('La fecha de inscripción no puede ser futura');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la respuesta de la API a modelo local
   */
  mapResponseToModel(response: InscripcionClaseResponse): InscripcionClase {
    // Construir objetos anidados de forma robusta si vienen aplanados
    const cliente = response.cliente ?? (
      (response as any).cliente_nombre ? {
        idCliente: response.idCliente,
        nombre: (response as any).cliente_nombre,
        apellido: (response as any).cliente_apellido ?? '',
        email: (response as any).cliente_email ?? ''
      } : undefined
    );

    const entrenador = response.entrenador ?? (
      (response as any).entrenador_nombre ? {
        idEntrenador: response.idEntrenador,
        nombre: (response as any).entrenador_nombre,
        apellido: (response as any).entrenador_apellido ?? '',
        especialidad: (response as any).entrenador_especialidad ?? undefined
      } : undefined
    );

    const clase = response.clase ?? (
      (response as any).clase_nombre ? {
        idClase: response.idClase,
        nombre: (response as any).clase_nombre,
        descripcion: (response as any).clase_descripcion ?? '',
        capacidad: Number((response as any).clase_capacidad ?? 0)
      } : undefined
    );

    return new InscripcionClase(
      response.idInscripcionClase,
      response.idCliente,
      response.idEntrenador,
      response.idClase,
      response.fechaInscripcion,
      cliente,
      entrenador,
      clase
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(inscripcion: InscripcionClase): InscripcionClaseFormData {
    return {
      idCliente: inscripcion.idCliente,
      idEntrenador: inscripcion.idEntrenador,
      idClase: inscripcion.idClase,
      fechaInscripcion: inscripcion.fechaInscripcion
    };
  }
}