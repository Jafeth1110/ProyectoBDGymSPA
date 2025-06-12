export class Mantenimiento {
  constructor(
    public idMantenimiento: number = 0,
    public descripcion: string = '',
    public costo: number = 0,
    public idAdmin: number = 0,
  ) {}
}