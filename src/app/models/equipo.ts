export class Equipo {
  constructor(
    public idEquipo: number = 0,
    public nombre: string = '',
    public tipo: string = '',
    public estado: number = 1, // 1=activo, 0=inactivo (ajusta según tu lógica)
    public cantidad: number = 0
  ) {}
}