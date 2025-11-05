import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { server } from './global';
import { ErrorHandlerService } from './error-handler.service';
import { ValidationService } from './validation.service';
import { 
  LoginResponse, 
  UserRegistrationData, 
  ApiResponse, 
  UserResponse,
  ROLES
} from '../models/api-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = server.url.slice(0, -1); // Remover la barra final
  private identitySubject = new BehaviorSubject<any>(null);
  private jwtHelper = new JwtHelperService();
  
  public currentIdentity = this.identitySubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private validationService: ValidationService
  ) {
    this.initializeIdentity();
  }

  private initializeIdentity(): void {
    const token = this.getToken();
    const identity = this.getIdentity();

    if (token && !this.isTokenExpired(token) && identity) {
      this.identitySubject.next(identity);
    } else {
      this.clearSession();
    }
  }

  // Método de login que usa el formato correcto del backend
  login(email: string, password: string): Observable<any> {
    // Validar email y password antes de enviar
    const emailValidation = this.validationService.validateEmail(email);
    const passwordValidation = this.validationService.validatePassword(password);
    
    if (!emailValidation.valid || !passwordValidation.valid) {
      const errors: string[] = [];
      if (!emailValidation.valid && emailValidation.message) errors.push(emailValidation.message);
      if (!passwordValidation.valid && passwordValidation.message) errors.push(passwordValidation.message);
      
      return throwError(() => ({
        status: 422,
        message: 'Errores de validación',
        errors: errors
      }));
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const data = { email: normalizedEmail, password };
    
    console.log('Enviando datos de login:', data);
    
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const payload = { data: data };
    
    console.log('URL completa:', `${this.baseUrl}/user/login`);
    console.log('Payload enviado:', payload);
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/user/login`, payload, { headers }).pipe(
      tap((response: any) => {
        console.log('Respuesta completa del login:', response);
        // Solo loggeamos, el componente se encarga del resto
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Registro de usuario
  register(userData: UserRegistrationData): Observable<any> {
    // Validar los datos antes de enviar
    const validation = this.validationService.validateUser(userData);
    if (!validation.valid) {
      return throwError(() => ({
        status: 422,
        message: 'Errores de validación',
        errors: validation.errors
      }));
    }
    
    // Limpiar los datos
    const cleanedData = this.validationService.cleanUserData(userData);
    
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const payload = { data: cleanedData };
    
    console.log('Registrando usuario:', payload);
    
    return this.http.post<ApiResponse<UserResponse>>(`${this.baseUrl}/user/add`, payload, { headers }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  getIdentityFromApi(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    console.log('getIdentityFromApi - Enviando request con token:', token.substring(0, 20) + '...');
    
    return this.http.get<ApiResponse<UserResponse>>(`${this.baseUrl}/user/getidentity`, { headers }).pipe(
      tap(response => {
        console.log('getIdentityFromApi - Respuesta completa:', response);
      }),
      catchError(error => {
        console.error('Error obteniendo identidad:', error);
        this.clearSession();
        return this.errorHandler.handleError(error);
      })
    );
  }

  saveSession(token: string, identity: any): void {
    console.log('saveSession llamado con:', { token: token.substring(0, 20) + '...', identity });
    localStorage.setItem('session_active', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('identity', JSON.stringify(identity));
    localStorage.setItem('token_expiration', (Date.now() + 3600000).toString());
    
    // Actualizar el observable de identidad
    this.identitySubject.next(identity);
    console.log('identitySubject actualizado con:', identity);
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return this.http.post(`${this.baseUrl}/logout`, {}, { headers }).pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(error => {
          this.clearSession();
          return of(null);
        })
      );
    }
    this.clearSession();
    return of(null);
  }

  public clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('identity');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('session_active'); // También limpiar la marca de sesión
    this.identitySubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getIdentity(): any | null {
    const identity = localStorage.getItem('identity');
    return identity ? JSON.parse(identity) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      return true;
    }
  }

  refreshIdentity(): void {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        this.getIdentityFromApi(token).subscribe();
      }
    } else {
      this.clearSession();
    }
  }

  // Nuevos métodos para obtener información del usuario actual
  getCurrentUser(): any | null {
    return this.getIdentity();
  }

  /**
   * Devuelve el rol del usuario actual normalizado como clave en minúsculas
   * Posibles valores: 'admin' | 'cliente' | 'entrenador'
   */
  getCurrentUserRole(): string | null {
    const identity = this.getCurrentUser();
    if (!identity) return null;

    // 1) Intentar por idRol directo en identidad
    const rawId: any = identity.idRol ?? identity?.rol?.idRol ?? identity?.id_rol ?? identity?.rolId ?? identity?.roleId;
    const idRol = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
    if (typeof idRol === 'number' && !isNaN(idRol)) {
      switch (idRol) {
        case ROLES.ADMIN: return 'admin';
        case ROLES.CLIENTE: return 'cliente';
        case ROLES.ENTRENADOR: return 'entrenador';
      }
    }

    // 2) Intentar por nombre del rol en objeto rol
    const nombreRol: string | undefined = identity?.rol?.nombreRol || identity?.rol?.nombre || identity?.role || identity?.Rol || identity?.Role;
    if (typeof nombreRol === 'string') {
      const v = nombreRol.toLowerCase();
      if (['admin', 'administrator', 'administrador'].includes(v)) return 'admin';
      if (['cliente', 'client', 'user', 'usuario'].includes(v)) return 'cliente';
      if (['entrenador', 'coach', 'trainer'].includes(v)) return 'entrenador';
    }

    // 3) rol como string directo (ej: identity.rol = 'admin')
    if (typeof identity?.rol === 'string') {
      const v = identity.rol.toLowerCase();
      if (['admin', 'administrator', 'administrador'].includes(v)) return 'admin';
      if (['cliente', 'client', 'user', 'usuario'].includes(v)) return 'cliente';
      if (['entrenador', 'coach', 'trainer'].includes(v)) return 'entrenador';
    }

    return null;
  }

  /**
   * Id numérico del rol actual (1=ADMIN, 2=CLIENTE, 3=ENTRENADOR)
   */
  getCurrentUserRoleId(): number | null {
    const identity = this.getCurrentUser();
    if (!identity) return null;
    const raw1 = identity.idRol ?? identity?.rol?.idRol ?? identity?.id_rol ?? identity?.rolId ?? identity?.roleId;
    const id = typeof raw1 === 'string' ? parseInt(raw1, 10) : raw1;
    if (typeof id === 'number' && !isNaN(id)) return id;

    // Derivar por nombre si no hay id
    const role = this.getCurrentUserRole();
    if (role === 'admin') return ROLES.ADMIN;
    if (role === 'cliente') return ROLES.CLIENTE;
    if (role === 'entrenador') return ROLES.ENTRENADOR;
    return null;
  }

  /**
   * Nombre legible del rol (Administrador, Cliente, Entrenador)
   */
  getCurrentUserRoleName(): string | null {
    const identity = this.getCurrentUser();
    if (!identity) return null;
    // Preferir nombre del backend si viene
    const nombre = identity?.rol?.nombreRol || identity?.rol?.nombre;
    if (typeof nombre === 'string' && nombre.trim()) return nombre;
    // Mapear por id si existe
    const id = this.getCurrentUserRoleId();
    if (id === ROLES.ADMIN) return 'Administrador';
    if (id === ROLES.CLIENTE) return 'Cliente';
    if (id === ROLES.ENTRENADOR) return 'Entrenador';
    // Por clave normalizada
    const key = this.getCurrentUserRole();
    if (key === 'admin') return 'Administrador';
    if (key === 'cliente') return 'Cliente';
    if (key === 'entrenador') return 'Entrenador';
    return null;
  }

  isCurrentUserAdmin(): boolean {
    const roleKey = this.getCurrentUserRole();
    const roleId = this.getCurrentUserRoleId();
    const roleName = this.getCurrentUserRoleName()?.toLowerCase();

    const isAdmin = roleId === ROLES.ADMIN 
      || roleKey === 'admin' 
      || (roleName ? ['admin', 'administrador', 'administrator'].includes(roleName) : false);

    return !!isAdmin;
  }

  getCurrentUserId(): number | null {
    const identity = this.getCurrentUser();
    return identity?.idUsuario || identity?.id || identity?.sub || null;
  }

  /**
   * Obtiene el sub del JWT (idUsuario del backend)
   */
  getCurrentUserSub(): number | null {
    const identity = this.getCurrentUser();
    return identity?.sub || identity?.idUsuario || identity?.id || null;
  }

  getCurrentUserEmail(): string | null {
    const identity = this.getCurrentUser();
    return identity?.email || null;
  }

  getCurrentUserFullName(): string | null {
    const identity = this.getCurrentUser();
    if (identity?.nombre && identity?.apellido) {
      return `${identity.nombre} ${identity.apellido}`;
    }
    return identity?.name || null;
  }

  /**
   * Devuelve el idCliente del usuario actual si es cliente, o null si no aplica
   */
  getCurrentClienteId(): number | null {
    const identity = this.getCurrentUser();
    if (!identity) return null;
    if (typeof identity?.cliente?.idCliente === 'number') return identity.cliente.idCliente;
    // Algunos endpoints entregan aplanado
    if (typeof identity?.idCliente === 'number') return identity.idCliente;
    return null;
  }

  /**
   * Devuelve el idEntrenador del usuario actual si es entrenador, o null si no aplica
   */
  getCurrentEntrenadorId(): number | null {
    const identity = this.getCurrentUser();
    if (!identity) return null;
    if (typeof identity?.entrenador?.idEntrenador === 'number') return identity.entrenador.idEntrenador;
    if (typeof identity?.idEntrenador === 'number') return identity.idEntrenador;
    return null;
  }
}