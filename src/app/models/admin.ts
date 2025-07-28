export interface Admin {
  idAdmin: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  cedula: string;
  rol: string;
  fechaAsignacion?: string;
  permisos?: any[];
}
