import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { Pago } from "../models/pago";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  PagoResponse, 
  PagoFormData 
} from "../models/api-interfaces";

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private urlAPI: string;

  constructor(private _http: HttpClient) {
    this.urlAPI = server.url + 'pagos/';
  }

  /**
   * Obtiene headers con token de autorización
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene todos los pagos
   */
  getPagos(): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(this.urlAPI, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene un pago específico por ID
   */
  getPago(id: number): Observable<ApiResponse<PagoResponse>> {
    return this._http.get<ApiResponse<PagoResponse>>(`${this.urlAPI}${id}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Crea un nuevo pago
   */
  addPago(pagoData: PagoFormData): Observable<ApiResponse<any>> {
    // Validaciones
    const validation = this.validatePagoData(pagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return this._http.post<ApiResponse<any>>(this.urlAPI, { data: pagoData }, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualiza un pago existente
   */
  updatePago(id: number, pagoData: PagoFormData): Observable<ApiResponse<any>> {
    // Validaciones
    const validation = this.validatePagoData(pagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return this._http.put<ApiResponse<any>>(`${this.urlAPI}${id}`, { data: pagoData }, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Elimina un pago
   */
  deletePago(id: number): Observable<ApiResponse<any>> {
    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por cliente
   */
  getPagosByCliente(idCliente: number): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}cliente/${idCliente}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por membresía
   */
  getPagosByMembresia(idMembresia: number): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}membresia/${idMembresia}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por detalle de mantenimiento
   */
  getPagosByDetalleMantenimiento(idDetalleMantenimiento: number): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}mantenimiento/${idDetalleMantenimiento}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por tipo (ingresos o gastos)
   */
  getPagosByTipo(tipoPago: 'membresia' | 'mantenimiento'): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}tipo/${tipoPago}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por método de pago
   */
  getPagosByMetodoPago(idMetodoPago: number): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}metodo-pago/${idMetodoPago}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene resumen de pagos
   */
  getResumenPagos(): Observable<ApiResponse<any>> {
    return this._http.get<ApiResponse<any>>(`${this.urlAPI}resumen`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene pagos por período
   */
  getPagosPorPeriodo(fechaInicio: string, fechaFin: string): Observable<ApiResponse<PagoResponse[]>> {
    return this._http.get<ApiResponse<PagoResponse[]>>(`${this.urlAPI}reportes/por-periodo`, { 
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      headers: this.getHeaders() 
    });
  }

  /**
   * Valida los datos de un pago
   */
  private validatePagoData(pagoData: PagoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar tipo de pago
    if (!pagoData.tipoPago || (pagoData.tipoPago !== 'membresia' && pagoData.tipoPago !== 'mantenimiento')) {
      errors.push('Debe seleccionar un tipo de pago válido');
    }

    // Validar según el tipo de pago
    if (pagoData.tipoPago === 'membresia') {
      if (!pagoData.idMembresia || pagoData.idMembresia <= 0) {
        errors.push('Debe seleccionar una membresía válida');
      }
    } else if (pagoData.tipoPago === 'mantenimiento') {
      if (!pagoData.idDetalleMantenimiento || pagoData.idDetalleMantenimiento <= 0) {
        errors.push('Debe seleccionar un detalle de mantenimiento válido');
      }
    }

    // Validar método de pago
    if (!pagoData.idMetodoPago || pagoData.idMetodoPago <= 0) {
      errors.push('Debe seleccionar un método de pago válido');
    }

    // Validar monto
    if (!pagoData.monto || pagoData.monto <= 0) {
      errors.push('El monto debe ser mayor a 0');
    } else if (pagoData.monto > 10000000) {
      errors.push('El monto no puede exceder ₡10,000,000');
    }

    // Validar fecha de pago
    if (!pagoData.fechaPago || pagoData.fechaPago.trim().length === 0) {
      errors.push('La fecha de pago es obligatoria');
    } else {
      const fechaPago = new Date(pagoData.fechaPago);
      if (isNaN(fechaPago.getTime())) {
        errors.push('La fecha de pago no es válida');
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
  mapResponseToModel(response: PagoResponse): Pago {
    return new Pago(
      // Datos principales del pago
      response.idPago,
      response.fechaPago,
      response.monto,
      response.tipoPago,
      response.descripcion || '',
      
      // IDs de relaciones (condicionales según tipo de pago)
      response.idMembresia || 0,
      response.idMetodoPago,
      response.idDetalleMantenimiento || 0,
      
      // Datos de la membresía (solo para pagos de membresía)
      response.tipoMem || '',
      response.membresia_precio || 0,
      response.fechaVenc || '',
      response.fechaInicio || '',
      response.membresia_estado || 1,
      
      // Datos del método de pago
      response.metodoPago_nombre || '',
      response.metodoPago_descripcion || '',
      response.metodoPago_comision || 0,
      response.metodoPago_requiereAutorizacion || 0,
      response.metodoPago_estado || 1,
      
      // Datos del cliente (solo para pagos de membresía)
      response.idCliente || 0,
      response.cliente_nombre || '',
      response.cliente_apellido || '',
      response.cliente_email || '',
      
      // Datos de mantenimiento (solo para pagos de mantenimiento)
      response.equipo_nombre || '',
      response.equipo_tipo || '',
      response.mantenimiento_tipo || '',
      response.mantenimiento_descripcion || '',
      
      // Datos del admin (para pagos de mantenimiento)
      response.idAdmin || 0,
      response.admin_nombre || '',
      response.admin_apellido || '',
      response.admin_email || ''
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(pago: Pago): PagoFormData {
    const formData: PagoFormData = {
      tipoPago: pago.tipoPago,
      idMetodoPago: pago.idMetodoPago,
      fechaPago: pago.fechaPago,
      monto: pago.monto,
      descripcion: pago.descripcion
    };

    // Agregar campos condicionales según el tipo de pago
    if (pago.tipoPago === 'membresia') {
      formData.idMembresia = pago.idMembresia;
    } else if (pago.tipoPago === 'mantenimiento') {
      formData.idDetalleMantenimiento = pago.idDetalleMantenimiento;
    }

    return formData;
  }
}