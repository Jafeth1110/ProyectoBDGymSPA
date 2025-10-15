export class InscripcionClase {
  constructor(
    public idInscripcionClase: number = 0,
    public idCliente: number = 0,
    public idClase: number = 0,
    public fechaInscripcion: string = '',
    public estado: number = 1, // 1: Activa, 0: Inactiva
    public cliente?: {
      idCliente: number;
      nombre: string;
      apellido: string;
      email: string;
    },
    public clase?: {
      idClase: number;
      nombre: string;
      descripcion: string;
      capacidad: number;
    }
  ) {}

  // Método para validar los datos de la inscripción
  isValid(): boolean {
    return this.idCliente > 0 && 
           this.idClase > 0 && 
           this.fechaInscripcion.trim() !== '';
  }

  // Método para obtener el nombre completo del cliente
  getNombreCliente(): string {
    if (this.cliente) {
      return `${this.cliente.nombre} ${this.cliente.apellido}`;
    }
    return '';
  }

  // Método para obtener el estado como texto
  getEstadoTexto(): string {
    return this.estado === 1 ? 'Activa' : 'Inactiva';
  }

  // Método para cambiar el estado
  toggleEstado(): void {
    this.estado = this.estado === 1 ? 0 : 1;
  }
}