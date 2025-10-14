import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "./global";
import { User } from "../models/user";
import { Observable } from "rxjs";
import { 
  ApiResponse, 
  UserResponse, 
  UserRegistrationData, 
  PhoneData,
  ROLES 
} from "../models/api-interfaces";
import { ValidationService } from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private urlAPI: string;

  constructor(
    private _http: HttpClient,
    private validationService: ValidationService
  ) {
    this.urlAPI = server.url + 'user/';
  }

  login(email: string, password: string): Observable<any> {
    // Validar email y password antes de enviar
    const emailValidation = this.validationService.validateEmail(email);
    const passwordValidation = this.validationService.validatePassword(password);
    
    if (!emailValidation.valid || !passwordValidation.valid) {
      const errors: string[] = [];
      if (!emailValidation.valid && emailValidation.message) errors.push(emailValidation.message);
      if (!passwordValidation.valid && passwordValidation.message) errors.push(passwordValidation.message);
      
      return new Observable(observer => {
        observer.error({
          status: 422,
          message: 'Errores de validación',
          errors: errors
        });
      });
    }
    
    // Convertir email a minúsculas para normalizar
    const normalizedEmail = email.toLowerCase().trim();
    const data = { email: normalizedEmail, password };
    
    console.log('Enviando datos de login:', data);
    
    // Enviar en formato JSON dentro de un objeto "data" como espera Laravel
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const payload = { data: data };
    
    console.log('URL completa:', `${this.urlAPI}login`);
    console.log('Payload enviado:', payload);
    
    return this._http.post(`${this.urlAPI}login`, payload, { headers });
  }

  getIdentityFromAPI(): Observable<any> {
    return this._http.get(this.urlAPI + 'getidentity');
  }

  storeUser(user: User): Observable<any> {
  const userData: any = {
    nombre: user.nombre,
    apellido: user.apellido,
    cedula: user.cedula,
    email: user.email.toLowerCase().trim(),
    password: user.password,
    idRol: user.getIdRol()
  };

  // Agregar teléfonos si existen
  if (user.telefonos.length > 0) {
    userData.telefonos = user.telefonos.map(t => ({
      telefono: t.telefono,
      tipoTel: t.tipoTel
    }));
  }


  const payload = { data: userData };
  console.log('Payload final a enviar:', payload);

  return this._http.post(this.urlAPI + 'add', payload);
}


  getUsers(): Observable<any> {
    console.log('Llamando getUsers - El interceptor agregará el token automáticamente');
    console.log('URL completa getUsers:', this.urlAPI + 'getUsers');

    // Agregar headers para evitar cache
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // El TokenInterceptor agregará automáticamente el header Authorization
    return this._http.get(this.urlAPI + 'getUsers', { headers });
  }

  deleteUser(email: string): Observable<any> {
    // Normalizar el email a minúsculas
    const normalizedEmail = email.toLowerCase().trim();
    
    return this._http.delete(this.urlAPI + 'destroyUser/' + normalizedEmail);
  }

  // Si quieres buscar por ID:
  showUser(email: string): Observable<any> {
    // Normalizar el email a minúsculas
    const normalizedEmail = email.toLowerCase().trim();
    
    // Agregar headers para evitar cache
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return this._http.get(this.urlAPI + 'getUser/' + normalizedEmail, { headers });
  }

  updateUser(email: string, body: any): Observable<any> {
    console.log('Datos recibidos para actualizar:', body);

    return this._http.put(this.urlAPI + 'updateUser/' + email.toLowerCase().trim(), body);
  }



  // Métodos para manejar teléfonos usando las rutas específicas del backend
  addTelefonoToUser(email: string, telefono: { tipoTel: string, telefono: string }): Observable<any> {
    // Validar teléfono antes de enviar
    const telefonoValidation = this.validationService.validateTelefono(telefono.telefono);
    const tipoValidation = this.validationService.validateTipoTelefono(telefono.tipoTel);
    
    if (!telefonoValidation.valid || !tipoValidation.valid) {
      const errors: string[] = [];
      if (!telefonoValidation.valid && telefonoValidation.message) errors.push(telefonoValidation.message);
      if (!tipoValidation.valid && tipoValidation.message) errors.push(tipoValidation.message);
      
      return new Observable(observer => {
        observer.error({
          status: 422,
          message: 'Errores de validación',
          errors: errors
        });
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const payload = { data: telefono };
    
    return this._http.post(`${this.urlAPI}${normalizedEmail}/telefono`, payload);
  }

  getUserTelefonos(email: string): Observable<any> {
    const normalizedEmail = email.toLowerCase().trim();
    
    return this._http.get(`${this.urlAPI}${normalizedEmail}/telefonos`);
  }

  // Método para actualizar todos los teléfonos de un usuario (usa la nueva ruta)
  updateUserTelefonos(email: string, telefonos: Array<{tipoTel: string, telefono: string}>): Observable<any> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Filtrar y validar teléfonos válidos
    const telefonosValidos = telefonos.filter(tel => 
      tel.telefono && tel.telefono.trim() !== ''
    );
    
    // Validar cada teléfono
    for (const tel of telefonosValidos) {
      const telefonoValidation = this.validationService.validateTelefono(tel.telefono);
      const tipoValidation = this.validationService.validateTipoTelefono(tel.tipoTel);
      
      if (!telefonoValidation.valid || !tipoValidation.valid) {
        return new Observable(observer => {
          observer.error({
            status: 422,
            message: 'Error en teléfonos',
            errors: [telefonoValidation.message || tipoValidation.message]
          });
        });
      }
    }
    
    const payload = { data: { telefonos: telefonosValidos } };
    
    return this._http.put(`${this.urlAPI}${normalizedEmail}/telefonos`, payload);
  }

  // Método para limpiar todos los teléfonos de un usuario
  clearUserTelefonos(email: string): Observable<any> {
    const normalizedEmail = email.toLowerCase().trim();
    
    return this._http.delete(`${this.urlAPI}${normalizedEmail}/telefonos`);
  }

  // Método para obtener TODOS los teléfonos usando la nueva ruta del backend
  getAllTelefonos(): Observable<any> {
    // Usar la nueva ruta /telefonos que devuelve todos los teléfonos
    console.log('Obteniendo todos los teléfonos desde:', server.url + 'telefonos');
    return this._http.get(server.url + 'telefonos');
  }

  // NUEVOS MÉTODOS SIMPLIFICADOS para manejar teléfonos directamente desde user
  
  // Obtener todos los teléfonos de un usuario por email
  getUserTelefonosSimple(email: string): Observable<any> {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Obteniendo teléfonos del usuario:', normalizedEmail);
    return this._http.get(`${this.urlAPI}${normalizedEmail}/telefonos`);
  }

  // Agregar un teléfono individual a un usuario
  addSingleTelefonoToUser(email: string, telefono: { telefono: string; tipoTel: string }): Observable<any> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validar teléfono
    const telefonoRegex = /^\d{8,12}$/;
    if (!telefonoRegex.test(telefono.telefono)) {
      return new Observable(observer => {
        observer.error({
          status: 422,
          message: 'El teléfono debe tener entre 8 y 12 dígitos',
          errors: ['El teléfono debe tener entre 8 y 12 dígitos']
        });
      });
    }

    if (!['celular', 'casa', 'trabajo'].includes(telefono.tipoTel)) {
      return new Observable(observer => {
        observer.error({
          status: 422,
          message: 'Tipo de teléfono inválido',
          errors: ['El tipo debe ser: celular, casa o trabajo']
        });
      });
    }

    const payload = { data: telefono };
    console.log('Agregando teléfono individual:', payload);
    console.log('URL:', `${this.urlAPI}${normalizedEmail}/telefono`);
    
    return this._http.post(`${this.urlAPI}${normalizedEmail}/telefono`, payload);
  }

  // Actualizar un teléfono específico por ID (requiere saber el ID del teléfono)
  updateSingleTelefono(telefonoId: number, telefono: { telefono: string; tipoTel: string }): Observable<any> {
    // Validar teléfono
    const telefonoRegex = /^\d{8,12}$/;
    if (!telefonoRegex.test(telefono.telefono)) {
      return new Observable(observer => {
        observer.error({
          status: 422,
          message: 'El teléfono debe tener entre 8 y 12 dígitos',
          errors: ['El teléfono debe tener entre 8 y 12 dígitos']
        });
      });
    }

    const payload = { data: telefono };
    console.log('Actualizando teléfono ID:', telefonoId, 'con datos:', payload);
    
    // Usar la ruta específica para actualizar un teléfono por ID
    return this._http.put(`${server.url}telefono/${telefonoId}`, payload);
  }

  // Eliminar un teléfono específico por ID
  deleteSingleTelefono(telefonoId: number): Observable<any> {
    console.log('Eliminando teléfono ID:', telefonoId);
    return this._http.delete(`${server.url}telefono/${telefonoId}`);
  }

  // Obtener un teléfono específico por ID 
  getSingleTelefono(telefonoId: number): Observable<any> {
    console.log('Obteniendo teléfono ID:', telefonoId);
    return this._http.get(`${server.url}telefono/${telefonoId}`);
  }
}
