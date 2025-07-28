import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Maneja errores HTTP de la API
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    let errorDetails: any = null;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido. No tienes permisos para esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 422:
          errorMessage = 'Datos de validación incorrectos.';
          if (error.error && error.error.errors) {
            errorDetails = error.error.errors;
          }
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}`;
      }

      // Si el backend envía un mensaje específico, usarlo
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    const errorResponse = {
      status: error.status || 0,
      message: errorMessage,
      details: errorDetails,
      originalError: error
    };

    console.error('Error de API:', errorResponse);
    
    return throwError(() => errorResponse);
  }

  /**
   * Extrae mensajes de error de la respuesta del backend
   */
  extractErrorMessages(error: any): string[] {
    const messages: string[] = [];

    if (error.details) {
      if (Array.isArray(error.details)) {
        messages.push(...error.details);
      } else if (typeof error.details === 'object') {
        // Laravel puede enviar errores como objeto con arrays
        Object.values(error.details).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            messages.push(...errorArray);
          } else {
            messages.push(String(errorArray));
          }
        });
      }
    }

    if (messages.length === 0 && error.message) {
      messages.push(error.message);
    }

    return messages.length > 0 ? messages : ['Ha ocurrido un error desconocido'];
  }

  /**
   * Verifica si el error es relacionado con autenticación
   */
  isAuthError(error: any): boolean {
    return error.status === 401 || error.status === 403;
  }

  /**
   * Verifica si el error es de validación
   */
  isValidationError(error: any): boolean {
    return error.status === 422;
  }

  /**
   * Formatea mensajes de error para mostrar al usuario
   */
  formatErrorMessage(error: any): string {
    const messages = this.extractErrorMessages(error);
    return messages.join('. ');
  }
}
