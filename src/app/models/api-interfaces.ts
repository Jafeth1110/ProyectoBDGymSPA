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
  idMembresia: string;          // Cambiado a string
  idCliente: string | null;     // Cambiado a string/null
  nombre?: string;
  descripcion?: string;
  tipoMem: string;
  precio: string;               // Cambiado a string
  descuento?: string;           // Cambiado a string
  fechaVenc: string | null;     // Permite null
  fechaInicio: string | null;   // Permite null
  fechaCreacion?: string;
  estado: string;               // Cambiado a string
  esPlantilla?: string;         // Cambiado a string
  precioFinal?: string;         // Nuevo campo como string
  precio_formateado?: string;
  precio_final?: number;
  estado_texto?: string;
  // Formato de objeto cliente (si viene separado)
  cliente?: {
    idCliente: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  // Formato directo (como en getActivas, getVencidas, etc.)
  cliente_nombre?: string | null;
  cliente_apellido?: string | null;
  cliente_email?: string | null;
  cliente_fechaRegistro?: string | null;
}

export interface MembresiaFormData {
  idCliente?: number;
  nombre?: string;
  descripcion?: string;
  tipoMem: string;
  precio: number;
  descuento?: number;
  fechaVenc?: string;
  fechaInicio?: string;
  estado?: number;
  esPlantilla?: number;
}

export interface PlantillaMembresiaFormData {
  nombre: string;
  descripcion?: string;
  tipoMem: string;
  precio: number;
  descuento?: number;
  estado?: number;
}

export interface MetodoPagoResponse {
  idMetodoPago: number;
  nombre: string;
  descripcion: string;
  estado: number;
  requiereAutorizacion: number;
  comision: number;
}

export interface PagoResponse {
  // Datos principales del pago
  idPago: number;
  fechaPago: string;
  monto: number;
  
  // Nuevos campos para el sistema híbrido
  tipoPago: 'membresia' | 'mantenimiento';
  descripcion?: string;
  
  // IDs de relaciones (condicionales según tipoPago)
  idMembresia?: number;
  idMetodoPago: number;
  idDetalleMantenimiento?: number;
  
  // Datos de la membresía (solo para tipoPago = 'membresia')
  tipoMem?: string;
  membresia_precio?: number;
  fechaVenc?: string;
  fechaInicio?: string;
  membresia_estado?: number;
  
  // Datos del método de pago
  metodoPago_nombre: string;
  metodoPago_descripcion?: string;
  metodoPago_comision: number;
  metodoPago_requiereAutorizacion: number;
  metodoPago_estado: number;
  
  // Datos del cliente (solo para tipoPago = 'membresia')
  idCliente?: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_email?: string;
  
  // Datos del mantenimiento (solo para tipoPago = 'mantenimiento')
  equipo_nombre?: string;
  equipo_tipo?: string;
  mantenimiento_tipo?: string;
  mantenimiento_descripcion?: string;

  // Datos del admin (para pagos de mantenimiento)
  idAdmin?: number;
  admin_nombre?: string;
  admin_apellido?: string;
  admin_email?: string;

  // Objetos relacionados completos (para casos específicos)
  cliente?: {
    idCliente: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  membresia?: {
    idMembresia: number;
    tipoMem: string;
    precio: number;
    fechaVenc: string;
    fechaInicio: string;
    idCliente: number;
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
  idCliente?: number;
  nombre?: string;
  descripcion?: string;
  tipoMem: string;
  precio: number;
  descuento?: number;
  fechaVenc?: string;
  fechaInicio?: string;
  estado?: number;
  esPlantilla?: number;
}

export interface MetodoPagoFormData {
  nombre: string;
  descripcion: string;
  estado: number;
  requiereAutorizacion: number;
  comision: number;
}

export interface PagoFormData {
  tipoPago: 'membresia' | 'mantenimiento';
  idMetodoPago: number;
  fechaPago: string;
  monto: number;
  descripcion?: string;
  // Campos condicionales
  idMembresia?: number; // Solo para tipoPago = 'membresia'
  idDetalleMantenimiento?: number; // Solo para tipoPago = 'mantenimiento'
}
