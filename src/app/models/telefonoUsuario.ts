export class TelefonoUsuario {
  constructor(
    public idTelefonoUsuario: number = 0,
    public idUsuario: number = 0,
    public tipoTel: string = '',
    public telefono: string = '',
    public usuario?: {
      nombre: string;
      apellido: string;
    }
  ) {}
}
