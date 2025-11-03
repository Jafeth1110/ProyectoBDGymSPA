export class InscripcionClase {
  constructor(
    public idInscripcionClase: number = 0,
    public idCliente: number = 0,
    public idEntrenador: number = 0,
    public idClase: number = 0,
    public fechaInscripcion: string = '',
    public cliente?: {
      idCliente: number;
      nombre: string;
      apellido: string;
      email: string;
    },
    public entrenador?: {
      idEntrenador: number;
      nombre: string;
      apellido: string;
      especialidad?: string;
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
           this.idEntrenador > 0 &&
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
}