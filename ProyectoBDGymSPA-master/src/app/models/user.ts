export class User {
  constructor(
    public idUsuario: number = 0, 
    public nombre: string = '',
    public apellido: string = '',
    public cedula: string = '',
    public email: string = '',
    public password: string = '',
    public rol: string = ''
  ) {}
}
