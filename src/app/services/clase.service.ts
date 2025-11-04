import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { Clase } from "../models/clase";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private urlAPI: string;

  constructor(private _http: HttpClient) {
    this.urlAPI = server.url + 'clases';
  }

  /**
   * Obtiene todas las clases
   */
  getClases(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<any>(this.urlAPI, { headers });
  }

  /**
   * Obtiene una clase específica por ID
   */
  getClase(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<any>(`${this.urlAPI}/${id}`, { headers });
  }

  /**
   * Crea una nueva clase
   */
  addClase(claseData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Preparar datos según lo que espera el backend
    const dataToSend = {
      diaSemana: claseData.diaSemana,
      hora: claseData.hora,
      nombre: claseData.nombre,
      descripcion: claseData.descripcion || null,
      cupoMax: claseData.cupoMax
    };

    return this._http.post<any>(this.urlAPI, dataToSend, { headers });
  }

  /**
   * Actualiza una clase existente
   */
  updateClase(id: number, claseData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Preparar datos según lo que espera el backend
    const dataToSend = {
      diaSemana: claseData.diaSemana,
      hora: claseData.hora,
      nombre: claseData.nombre,
      descripcion: claseData.descripcion || null,
      cupoMax: claseData.cupoMax
    };

    return this._http.put<any>(`${this.urlAPI}/${id}`, dataToSend, { headers });
  }

  /**
   * Elimina una clase
   */
  deleteClase(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<any>(`${this.urlAPI}/${id}`, { headers });
  }

  /**
   * Valida los datos de una clase
   */
  validateClaseData(claseData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar horario
    if (!claseData.horario || claseData.horario.trim().length === 0) {
      errors.push('El horario es obligatorio');
    }

    // Validar nombre
    if (!claseData.nombre || claseData.nombre.trim().length === 0) {
      errors.push('El nombre de la clase es obligatorio');
    } else if (claseData.nombre.trim().length > 45) {
      errors.push('El nombre de la clase no puede exceder 45 caracteres');
    }

    // Validar descripción
    if (claseData.descripcion && claseData.descripcion.trim().length > 255) {
      errors.push('La descripción no puede exceder 255 caracteres');
    }

    // Validar cupo máximo
    if (!claseData.cupoMax || claseData.cupoMax <= 0) {
      errors.push('El cupo máximo debe ser mayor a 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la respuesta de la API a modelo local
   */
  mapResponseToModel(response: any): Clase {
    return new Clase(
      response.idClase || 0,
      response.diaSemana || '',
      response.hora || '',
      response.nombre || '',
      response.descripcion || '',
      response.cupoMax || 0,
      response.cuposDisponibles !== undefined ? response.cuposDisponibles : undefined
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(clase: Clase): any {
    return {
      diaSemana: clase.diaSemana,
      hora: clase.hora,
      nombre: clase.nombre,
      descripcion: clase.descripcion,
      cupoMax: clase.cupoMax
    };
  }
}