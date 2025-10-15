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
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'pagos/';
  }

  /**
   * Obtiene todos los pagos
   */
  getPagos(): Observable<ApiResponse<PagoResponse[]>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<PagoResponse[]>>(this.urlAPI, { headers });
  }

  /**
   * Obtiene un pago específico por ID
   */
  getPago(id: number): Observable<ApiResponse<PagoResponse>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.get<ApiResponse<PagoResponse>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Crea un nuevo pago
   */
  addPago(pagoData: PagoFormData): Observable<ApiResponse<PagoResponse>> {
    // Validaciones
    const validation = this.validatePagoData(pagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(pagoData);
    return this._http.post<ApiResponse<PagoResponse>>(this.urlAPI, params, { headers });
  }

  /**
   * Actualiza un pago existente
   */
  updatePago(id: number, pagoData: PagoFormData): Observable<ApiResponse<PagoResponse>> {
    // Validaciones
    const validation = this.validatePagoData(pagoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = JSON.stringify(pagoData);
    return this._http.put<ApiResponse<PagoResponse>>(`${this.urlAPI}${id}`, params, { headers });
  }

  /**
   * Elimina un pago
   */
  deletePago(id: number): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this._http.delete<ApiResponse<any>>(`${this.urlAPI}${id}`, { headers });
  }

  /**
   * Valida los datos de un pago
   */
  private validatePagoData(pagoData: PagoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar cliente
    if (!pagoData.idCliente || pagoData.idCliente <= 0) {
      errors.push('Debe seleccionar un cliente válido');
    }

    // Validar membresía
    if (!pagoData.idMembresia || pagoData.idMembresia <= 0) {
      errors.push('Debe seleccionar una membresía válida');
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

    // Validar fecha de vencimiento
    if (!pagoData.fechaVencimiento || pagoData.fechaVencimiento.trim().length === 0) {
      errors.push('La fecha de vencimiento es obligatoria');
    } else {
      const fechaVencimiento = new Date(pagoData.fechaVencimiento);
      if (isNaN(fechaVencimiento.getTime())) {
        errors.push('La fecha de vencimiento no es válida');
      } else if (pagoData.fechaPago) {
        const fechaPago = new Date(pagoData.fechaPago);
        if (fechaVencimiento < fechaPago) {
          errors.push('La fecha de vencimiento no puede ser anterior a la fecha de pago');
        }
      }
    }

    // Validar estado
    const estadosValidos = ['Pendiente', 'Completado', 'Cancelado'];
    if (!pagoData.estado || !estadosValidos.includes(pagoData.estado)) {
      errors.push('El estado debe ser: Pendiente, Completado o Cancelado');
    }

    // Validar referencia (opcional pero si se proporciona debe tener formato)
    if (pagoData.referencia && pagoData.referencia.trim().length > 0) {
      if (pagoData.referencia.trim().length < 3) {
        errors.push('La referencia debe tener al menos 3 caracteres');
      } else if (pagoData.referencia.trim().length > 100) {
        errors.push('La referencia no puede exceder 100 caracteres');
      }
    }

    // Validar notas (opcional)
    if (pagoData.notas && pagoData.notas.trim().length > 1000) {
      errors.push('Las notas no pueden exceder 1000 caracteres');
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
      response.idPago,
      response.idCliente,
      response.idMembresia,
      response.idMetodoPago,
      response.monto,
      response.fechaPago,
      response.fechaVencimiento,
      response.estado,
      response.referencia,
      response.notas,
      response.cliente,
      response.membresia,
      response.metodoPago
    );
  }

  /**
   * Convierte el modelo local a datos para la API
   */
  mapModelToFormData(pago: Pago): PagoFormData {
    return {
      idCliente: pago.idCliente,
      idMembresia: pago.idMembresia,
      idMetodoPago: pago.idMetodoPago,
      monto: pago.monto,
      fechaPago: pago.fechaPago,
      fechaVencimiento: pago.fechaVencimiento,
      estado: pago.estado,
      referencia: pago.referencia,
      notas: pago.notas
    };
  }
}