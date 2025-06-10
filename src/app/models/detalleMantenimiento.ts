export class DetalleMantenimiento {
  constructor(
    public idDetalleMantenimiento: number = 0,
    public idAdmin: number = 0,
    public idEquipo: number = 0,
    public idMantenimiento: number = 0,
    public fechaMantenimiento: string = '' // formato 'YYYY-MM-DD'
  ) {}
}
