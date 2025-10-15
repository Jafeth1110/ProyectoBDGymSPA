import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { Clase } from "../models/clase";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  ClaseResponse, 
  ClaseFormData 
} from "../models/api-interfaces";
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'clases/';
  }

  /**
   * Obtiene todas las clases
   */
  getClases(): Observable<ApiResponse<ClaseResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<ClaseResponse[]>>(this.urlAPI, { headers });
  }

  /**
   * Obtiene una clase específica por ID
   */
  getClase(id: number): Observable<ApiResponse<ClaseResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<ClaseResponse>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Crea una nueva clase
   */
  addClase(claseData: ClaseFormData): Observable<ApiResponse<ClaseResponse>> {
    // Validaciones
    const validation = this.validateClaseData(claseData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(claseData);
    return this._http.post<ApiResponse<ClaseResponse>>(this.urlAPI, params, { headers });
  }

  /**
   * Actualiza una clase existente
   */
  updateClase(id: number, claseData: ClaseFormData): Observable<ApiResponse<ClaseResponse>> {
    // Validaciones
    const validation = this.validateClaseData(claseData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(claseData);
    return this._http.put<ApiResponse<ClaseResponse>>(`${this.urlAPI}${id}`, params, { headers });
  }

  /**
   * Elimina una clase
   */
  deleteClase(id: number): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Valida los datos de una clase
   */
  private validateClaseData(claseData: ClaseFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!claseData.nombre || claseData.nombre.trim().length === 0) {
      errors.push('El nombre de la clase es obligatorio');
    } else if (claseData.nombre.trim().length < 3) {
      errors.push('El nombre de la clase debe tener al menos 3 caracteres');
    } else if (claseData.nombre.trim().length > 100) {
      errors.push('El nombre de la clase no puede exceder 100 caracteres');
    }

    // Validar descripción
    if (!claseData.descripcion || claseData.descripcion.trim().length === 0) {
      errors.push('La descripción es obligatoria');
    } else if (claseData.descripcion.trim().length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    // Validar capacidad
    if (!claseData.capacidad || claseData.capacidad <= 0) {
      errors.push('La capacidad debe ser mayor a 0');
    } else if (claseData.capacidad > 100) {
      errors.push('La capacidad no puede exceder 100 personas');
    }

    // Validar entrenador
    if (!claseData.idEntrenador || claseData.idEntrenador <= 0) {
      errors.push('Debe seleccionar un entrenador válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la respuesta de la API a modelo local
   */
  mapResponseToModel(response: ClaseResponse): Clase {
    return new Clase(
      response.idClase,
      response.nombre,
      response.descripcion,
      response.capacidad,
      response.idEntrenador,
      response.entrenador
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(clase: Clase): ClaseFormData {
    return {
      nombre: clase.nombre,
      descripcion: clase.descripcion,
      capacidad: clase.capacidad,
      idEntrenador: clase.idEntrenador
    };
  }
}