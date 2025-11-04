import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { Membresia } from "../models/membresia";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
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

    return this._http.get<ApiResponse<MembresiaResponse[]>>(this.urlAPI, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
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

    return this._http.get<ApiResponse<MembresiaResponse>>(`${this.urlAPI}${id}`, { headers }).pipe(
      map((resp) => this.normalizeSingleResponse(resp))
    );
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

    const params = JSON.stringify({ data: membresiaData });
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
   * Obtiene membresías activas
   */
  getMembresiasByEstado(activas: boolean = true): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const endpoint = activas ? 'activas' : 'vencidas';
    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}${endpoint}`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Obtiene membresías por cliente
   */
  getMembresiasByCliente(idCliente: number): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}cliente/${idCliente}`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Actualiza estados de todas las membresías
   */
  actualizarEstados(): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.post<ApiResponse<any>>(`${this.urlAPI}update-estados`, {}, { headers });
  }

  /**
   * Valida los datos de una membresía
   */
  private validateMembresiaData(membresiaData: MembresiaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Determinar si es plantilla
    const esPlantilla = Number(membresiaData.esPlantilla) === 1 || String(membresiaData.esPlantilla) === "1";

    // Validar cliente (solo para membresías de cliente)
    if (!esPlantilla) {
      if (!membresiaData.idCliente || membresiaData.idCliente <= 0) {
        errors.push('Debe seleccionar un cliente válido para membresías de cliente');
      }
    }

    // Validar tipo de membresía (siempre requerido)
    const tiposValidos = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
    if (!membresiaData.tipoMem || !tiposValidos.includes(membresiaData.tipoMem)) {
      errors.push('El tipo de membresía debe ser uno de: ' + tiposValidos.join(', '));
    }

    // Validar precio (siempre requerido)
    const precioNum = Number(membresiaData.precio);
    if (!precioNum || precioNum <= 0) {
      errors.push('El precio debe ser mayor a 0');
    } else if (precioNum > 10000000) {
      errors.push('El precio no puede exceder ₡10,000,000');
    }

    // Validar fechas (solo para membresías de cliente)
    if (!esPlantilla) {
      if (!membresiaData.fechaInicio) {
        errors.push('La fecha de inicio es obligatoria para membresías de cliente');
      }

      if (!membresiaData.fechaVenc) {
        errors.push('La fecha de vencimiento es obligatoria para membresías de cliente');
      }

      // Validar que la fecha de vencimiento sea posterior a la de inicio
      if (membresiaData.fechaInicio && membresiaData.fechaVenc) {
        const fechaInicio = new Date(membresiaData.fechaInicio);
        const fechaVenc = new Date(membresiaData.fechaVenc);
        
        if (fechaVenc <= fechaInicio) {
          errors.push('La fecha de vencimiento debe ser posterior a la fecha de inicio');
        }
      }
    }

    // Validar estado (convertir a número para comparación)
    const estadoNum = Number(membresiaData.estado);
    if (estadoNum !== 0 && estadoNum !== 1) {
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
    const membresia = new Membresia(
      Number(response.idMembresia),
      response.idCliente ? Number(response.idCliente) : 0,
      response.nombre || '',
      response.descripcion || '',
      response.tipoMem,
      Number(response.precio),
      Number(response.descuento || 0),
      response.fechaVenc || '',
      response.fechaInicio || '',
      response.fechaCreacion || '',
      Number(response.estado),
      Number(response.esPlantilla || 0)
    );

    // Si el backend incluye datos del cliente en un objeto cliente separado
    if (response.cliente) {
      (membresia as any).clienteInfo = response.cliente;
    }
    // Si el backend incluye datos del cliente directamente en la respuesta (como en getActivas)
    else if ((response as any).cliente_nombre && (response as any).cliente_apellido) {
      (membresia as any).clienteInfo = {
        idCliente: response.idCliente,
        nombre: (response as any).cliente_nombre,
        apellido: (response as any).cliente_apellido,
        email: (response as any).cliente_email || ''
      };
    }

    // Nuevos campos de control de pagos (normalizados)
    const esPlantilla = String(response.esPlantilla) === '1';
    const pagada = response.pagada === true || (response.pagada as any) === 1 || (response.pagada as any) === '1';
    (membresia as any).pagada = pagada;
    (membresia as any).fechaUltimoPago = response.fechaUltimoPago || '';
    (membresia as any).requierePago = response.requierePago === true || (response.requierePago as any) === 1 || (response.requierePago as any) === '1';
    (membresia as any).estado_pago = response.estado_pago || (esPlantilla ? 'No aplica' : (pagada ? 'Pagada' : 'Pendiente de pago'));

    return membresia;
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(membresia: Membresia): MembresiaFormData {
    return {
      idCliente: membresia.idCliente,
      nombre: membresia.nombre,
      descripcion: membresia.descripcion,
      tipoMem: membresia.tipoMem,
      precio: membresia.precio,
      descuento: membresia.descuento,
      fechaVenc: membresia.fechaVenc,
      fechaInicio: membresia.fechaInicio,
      estado: membresia.estado,
      esPlantilla: membresia.esPlantilla
    };
  }

  /**
   * Obtiene plantillas de membresía disponibles
   */
  getPlantillas(): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}plantillas`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Crea una nueva plantilla de membresía
   */
  createPlantilla(plantillaData: any): Observable<ApiResponse<MembresiaResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify({ data: plantillaData });
    return this._http.post<ApiResponse<MembresiaResponse>>(`${this.urlAPI}plantillas`, params, { headers });
  }

  /**
   * Asigna una membresía a un cliente basada en una plantilla
   */
  asignarMembresiaCliente(asignacionData: any): Observable<ApiResponse<MembresiaResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify({ data: asignacionData });
    return this._http.post<ApiResponse<MembresiaResponse>>(`${this.urlAPI}asignar`, params, { headers });
  }

  /**
   * Obtiene membresías de un cliente específico
   */
  getMembresiasCliente(idCliente: number): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}cliente/${idCliente}`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Obtiene estadísticas de membresías
   */
  getEstadisticas(): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<any>>(`${this.urlAPI}estadisticas`, { headers });
  }

  /**
   * Obtiene membresías activas
   */
  getActivas(): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}activas`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Obtiene membresías vencidas
   */
  getVencidas(): Observable<ApiResponse<MembresiaResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<MembresiaResponse[]>>(`${this.urlAPI}vencidas`, { headers }).pipe(
      map((resp) => this.normalizeListResponse(resp))
    );
  }

  /**
   * Normaliza un listado de membresías en la respuesta para asegurar tipos y campos de pago
   */
  private normalizeListResponse(resp: ApiResponse<MembresiaResponse[]>): ApiResponse<MembresiaResponse[]> {
    if (resp && Array.isArray(resp.data)) {
      resp.data = resp.data.map((item) => this.normalizeMembresiaResponse(item));
    }
    return resp;
  }

  /**
   * Normaliza una respuesta individual de membresía
   */
  private normalizeSingleResponse(resp: ApiResponse<MembresiaResponse>): ApiResponse<MembresiaResponse> {
    if (resp && resp.data) {
      resp.data = this.normalizeMembresiaResponse(resp.data);
    }
    return resp;
  }

  /**
   * Asegura consistencia en campos de pago y plantilla en un item
   */
  private normalizeMembresiaResponse(item: MembresiaResponse): MembresiaResponse {
    const esPlantilla = String(item.esPlantilla) === '1';
    const pagada = item.pagada === true || (item.pagada as any) === 1 || (item.pagada as any) === '1';
    const requierePago = item.requierePago === true || (item.requierePago as any) === 1 || (item.requierePago as any) === '1';
    const estadoPago = item.estado_pago || (esPlantilla ? 'No aplica' : (pagada ? 'Pagada' : 'Pendiente de pago'));

    return {
      ...item,
      pagada,
      requierePago,
      estado_pago: estadoPago,
      fechaUltimoPago: item.fechaUltimoPago || null
    } as MembresiaResponse;
  }
}