import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { TelefonoService } from './telefono.service';
import { 
  UserRegistrationData, 
  PhoneData, 
  ROLES,
  NormalizedPhone 
} from '../models/api-interfaces';

@Injectable({
  providedIn: 'root'
})
export class GymApiService {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private telefonoService: TelefonoService
  ) { }

  // ===== MÉTODOS DE AUTENTICACIÓN =====

  /**
   * Login de usuario
   */
  login(email: string, password: string): Observable<any> {
    return this.authService.login(email, password);
  }

  /**
   * Registro de usuario como cliente
   */
  registerCliente(userData: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    password: string;
    telefonos?: PhoneData[];
  }): Observable<any> {
    const registrationData: UserRegistrationData = {
      ...userData,
      idRol: ROLES.CLIENTE
    };
    
    return this.authService.register(registrationData);
  }

  /**
   * Registro de usuario como admin
   */
  registerAdmin(userData: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    password: string;
    telefonos?: PhoneData[];
  }): Observable<any> {
    const registrationData: UserRegistrationData = {
      ...userData,
      idRol: ROLES.ADMIN
    };
    
    return this.authService.register(registrationData);
  }

  /**
   * Registro de usuario como entrenador
   */
  registerEntrenador(userData: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    password: string;
    telefonos?: PhoneData[];
  }): Observable<any> {
    const registrationData: UserRegistrationData = {
      ...userData,
      idRol: ROLES.ENTRENADOR
    };
    
    return this.authService.register(registrationData);
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    return this.authService.logout();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Obtener identidad del usuario actual
   */
  getCurrentUser(): any {
    return this.authService.getIdentity();
  }

  // ===== MÉTODOS DE USUARIOS =====

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): Observable<any> {
    return this.userService.getUsers();
  }

  /**
   * Obtener usuario por email
   */
  getUserByEmail(email: string): Observable<any> {
    return this.userService.showUser(email);
  }

  /**
   * Actualizar usuario
   */
  updateUser(email: string, userData: any): Observable<any> {
    return this.userService.updateUser(email, userData);
  }

  /**
   * Eliminar usuario
   */
  deleteUser(email: string): Observable<any> {
    return this.userService.deleteUser(email);
  }

  // ===== MÉTODOS DE TELÉFONOS =====

  /**
   * Obtener todos los teléfonos del sistema
   */
  getAllTelefonos(): Observable<any> {
    return this.telefonoService.getAllTelefonos();
  }

  /**
   * Obtener teléfonos de un usuario específico
   */
  getUserTelefonos(email: string): Observable<any> {
    return this.telefonoService.getUserTelefonos(email);
  }

  /**
   * Agregar teléfono a un usuario
   */
  addTelefonoToUser(email: string, telefono: PhoneData): Observable<any> {
    return this.telefonoService.addTelefonoToUser(email, telefono);
  }

  /**
   * Actualizar todos los teléfonos de un usuario
   */
  updateUserTelefonos(email: string, telefonos: PhoneData[]): Observable<any> {
    return this.telefonoService.updateUserTelefonos(email, telefonos);
  }

  /**
   * Eliminar todos los teléfonos de un usuario
   */
  clearUserTelefonos(email: string): Observable<any> {
    return this.telefonoService.clearUserTelefonos(email);
  }

  // ===== MÉTODOS UTILITARIOS =====

  /**
   * Crear datos de usuario para formularios
   */
  createUserFormData(formData: any, rol: 'cliente' | 'admin' | 'entrenador' = 'cliente'): UserRegistrationData {
    const userData: UserRegistrationData = {
      nombre: formData.nombre?.trim() || '',
      apellido: formData.apellido?.trim() || '',
      cedula: formData.cedula?.trim() || '',
      email: formData.email?.toLowerCase().trim() || '',
      password: formData.password || '',
      idRol: rol === 'admin' ? ROLES.ADMIN : rol === 'entrenador' ? ROLES.ENTRENADOR : ROLES.CLIENTE
    };

    // Agregar teléfonos si existen
    if (formData.telefonos && Array.isArray(formData.telefonos)) {
      const telefonosValidos = formData.telefonos.filter((tel: any) => 
        tel.telefono && tel.telefono.trim() !== ''
      );
      
      if (telefonosValidos.length > 0) {
        userData.telefonos = telefonosValidos;
      }
    }

    return userData;
  }

  /**
   * Obtener nombre del rol por ID
   */
  getRoleName(idRol: number): string {
    switch (idRol) {
      case ROLES.ADMIN:
        return 'Administrador';
      case ROLES.CLIENTE:
        return 'Cliente';
      case ROLES.ENTRENADOR:
        return 'Entrenador';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Validar si un email es válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar si un teléfono es válido
   */
  isValidTelefono(telefono: string): boolean {
    const telefonoRegex = /^\d{8,12}$/;
    return telefonoRegex.test(telefono);
  }

  /**
   * Formatear número de teléfono para mostrar
   */
  formatTelefono(telefono: string): string {
    if (!telefono) return '';
    
    // Si tiene 8 dígitos, formato: 2222-2222
    if (telefono.length === 8) {
      return `${telefono.substring(0, 4)}-${telefono.substring(4)}`;
    }
    
    // Si tiene más dígitos, mostrar con espacios cada 4
    return telefono.replace(/(\d{4})/g, '$1 ').trim();
  }

  /**
   * Obtener iniciales de un usuario
   */
  getUserInitials(nombre: string, apellido: string): string {
    const nombreInitial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const apellidoInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return `${nombreInitial}${apellidoInitial}`;
  }

  /**
   * Formatear nombre completo
   */
  getFullName(nombre: string, apellido: string): string {
    return `${nombre || ''} ${apellido || ''}`.trim();
  }
}
