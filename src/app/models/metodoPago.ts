export class MetodoPago {
  constructor(
    public idMetodoPago: number = 0,
    public nombre: string = '',
    public descripcion: string = '',
    public estado: number = 1, // 1: Activo, 0: Inactivo
    public requiereAutorizacion: number = 0, // 1: Requiere, 0: No requiere
    public comision: number = 0
  ) {}

  // Método para validar los datos del método de pago
  isValid(): boolean {
    return this.nombre.trim() !== '' && 
           this.comision >= 0 && 
           this.comision <= 100;
  }

  // Método para obtener el estado como texto
  getEstadoTexto(): string {
    return Number(this.estado) === 1 ? 'Activo' : 'Inactivo';
  }

  // Método para cambiar el estado
  toggleEstado(): void {
    this.estado = Number(this.estado) === 1 ? 0 : 1;
  }

  // Método para obtener si requiere autorización como texto
  getRequiereAutorizacionTexto(): string {
    return Number(this.requiereAutorizacion) === 1 ? 'Sí' : 'No';
  }

  // Método para obtener la comisión formateada
  getComisionFormateada(): string {
    return `${this.comision}%`;
  }
}