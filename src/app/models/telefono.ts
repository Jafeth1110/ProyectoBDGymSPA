export interface Telefono {
  idTelefono: number;
  idUsuario: number;
  telefono: string;
  tipoTel: string;
  idRol: number;
  // El backend envía 'usuario', no 'user'
  usuario?: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    cedula: string;
    rol?: string;
  };
  // También mantenemos 'user' para compatibilidad
  user?: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    cedula: string;
    rol: string;
  };
  rol?: {
    idRol: number;
    nombreRol: string;
    descripcion: string;
  };
}

export interface TelefonoRequest {
  idUsuario: number;
  telefono: string;
  tipoTel: 'celular' | 'casa' | 'trabajo';
}

export interface TelefonoResponse {
  status: number;
  message: string;
  data: Telefono | Telefono[];
}
