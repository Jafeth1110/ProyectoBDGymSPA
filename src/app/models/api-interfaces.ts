// ===== INTERFACES PRINCIPALES PARA LA API =====

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  errors?: any;
}

export interface LoginResponse {
  status: number;
  message: string;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  idUsuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  idRol: number;
  telefonos_list: Phone[];
  rol: Role;
  admin?: Admin;
  cliente?: Cliente;
  entrenador?: Entrenador;
}

export interface Phone {
  id: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
}

export interface Role {
  idRol: number;
  nombreRol: string;
  descripcion: string;
}

export interface Admin {
  idAdmin: number;
  idUsuario: number;
  telefonos?: AdminPhone[];
  user?: UserResponse;
}

export interface Cliente {
  idCliente: number;
  idUsuario: number;
  telefonos?: ClientePhone[];
  user?: UserResponse;
}

export interface Entrenador {
  idEntrenador: number;
  idUsuario: number;
  telefonos?: EntrenadorPhone[];
  user?: UserResponse;
}

export interface AdminPhone {
  idTelefono: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
  idUsuario: number;
  idRol: number;
}

export interface ClientePhone {
  idTelefono: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
  idUsuario: number;
  idRol: number;
}

export interface EntrenadorPhone {
  idTelefono: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
  idUsuario: number;
  idRol: number;
}

// ===== INTERFACES PARA FORMULARIOS =====

export interface UserRegistrationData {
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  password: string;
  idRol: number;
  telefonos?: Array<{
    telefono: string;
    tipoTel: 'celular' | 'casa' | 'trabajo';
  }>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PhoneData {
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
}

// ===== INTERFACES PARA TELÉFONOS NORMALIZADOS =====

export interface NormalizedPhone {
  id: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
  usuario: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  tipo: 'admin' | 'cliente' | 'entrenador';
}

// ===== CONSTANTES =====

export const ROLES = {
  ADMIN: 1,
  CLIENTE: 2,
  ENTRENADOR: 3
} as const;

export const TIPOS_TELEFONO = ['celular', 'casa', 'trabajo'] as const;

export type TipoTelefono = typeof TIPOS_TELEFONO[number];

// ===== INTERFACES PARA NUEVAS ENTIDADES =====

export interface ClaseResponse {
  idClase: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  idEntrenador: number;
  entrenador?: {
    idEntrenador: number;
    nombre: string;
    apellido: string;
    especialidad?: string;
  };
}

export interface InscripcionClaseResponse {
  idInscripcionClase: number;
  idCliente: number;
  idClase: number;
  fechaInscripcion: string;
  estado: number;
  cliente?: {
    idCliente: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  clase?: {
    idClase: number;
    nombre: string;
    descripcion: string;
    capacidad: number;
  };
}

export interface MembresiaResponse {
  idMembresia: number;
  tipo: string;
  precio: number;
  duracionMeses: number;
  descripcion: string;
  estado: number;
  beneficios?: string[];
}

export interface MetodoPagoResponse {
  idMetodoPago: number;
  nombre: string;
  descripcion: string;
  activo: number;
  requiereAutorizacion: number;
  comision: number;
}

export interface PagoResponse {
  idPago: number;
  idCliente: number;
  idMembresia: number;
  idMetodoPago: number;
  monto: number;
  fechaPago: string;
  fechaVencimiento: string;
  estado: string;
  referencia: string;
  notas: string;
  cliente?: {
    idCliente: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  membresia?: {
    idMembresia: number;
    tipo: string;
    precio: number;
    duracionMeses: number;
  };
  metodoPago?: {
    idMetodoPago: number;
    nombre: string;
    comision: number;
  };
}

// ===== INTERFACES PARA FORMULARIOS DE NUEVAS ENTIDADES =====

export interface ClaseFormData {
  nombre: string;
  descripcion: string;
  capacidad: number;
  idEntrenador: number;
}

export interface InscripcionClaseFormData {
  idCliente: number;
  idClase: number;
  fechaInscripcion: string;
  estado: number;
}

export interface MembresiaFormData {
  tipo: string;
  precio: number;
  duracionMeses: number;
  descripcion: string;
  estado: number;
  beneficios?: string[];
}

export interface MetodoPagoFormData {
  nombre: string;
  descripcion: string;
  activo: number;
  requiereAutorizacion: number;
  comision: number;
}

export interface PagoFormData {
  idCliente: number;
  idMembresia: number;
  idMetodoPago: number;
  monto: number;
  fechaPago: string;
  fechaVencimiento: string;
  estado: string;
  referencia: string;
  notas: string;
}
