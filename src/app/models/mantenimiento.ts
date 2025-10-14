export class Mantenimiento {
  constructor(
    public idMantenimiento: number = 0,
    public descripcion: string = '',
    public costo: number = 0,
    public idAdmin: number = 0,
    // Nuevos campos opcionales:
    public admin_idUsuario?: number,
    public admin_nombre?: string,
    public admin_apellido?: string,
    public admin_email?: string
  ) {}
}