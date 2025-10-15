export class Clase {
  constructor(
    public idClase: number = 0,
    public nombre: string = '',
    public descripcion: string = '',
    public capacidad: number = 0,
    public idEntrenador: number = 0,
    public entrenador?: {
      idEntrenador: number;
      nombre: string;
      apellido: string;
      especialidad?: string;
    }
  ) {}

  // Método para validar los datos de la clase
  isValid(): boolean {
    return this.nombre.trim() !== '' && 
           this.capacidad > 0 && 
           this.idEntrenador > 0;
  }

  // Método para obtener el nombre completo del entrenador
  getNombreEntrenador(): string {
    if (this.entrenador) {
      return `${this.entrenador.nombre} ${this.entrenador.apellido}`;
    }
    return '';
  }
}