export class Clase {
  constructor(
    public idClase: number = 0,
    public diaSemana: string = '',
    public hora: string = '',
    public nombre: string = '',
    public descripcion: string = '',
    public cupoMax: number = 0,
    public cuposDisponibles?: number // Nuevo campo opcional
  ) {}

  // Método para validar los datos de la clase
  isValid(): boolean {
    return this.nombre.trim() !== '' && 
           this.cupoMax > 0 && 
           this.diaSemana.trim() !== '' &&
           this.hora.trim() !== '';
  }

  // Días válidos según el backend
  static getDiasValidos(): string[] {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  }

  // Método para formatear hora a HH:MM
  private formatHora(hora: string): string {
    if (!hora) return '';
    
    // Si viene como datetime completo, extraer solo la hora
    if (hora.includes('T')) {
      const timePart = hora.split('T')[1];
      return timePart.substring(0, 5); // HH:MM
    }
    
    // Si viene con segundos y microsegundos (HH:MM:SS.sssssss)
    if (hora.includes(':')) {
      const parts = hora.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }
    
    // Si ya viene como HH:MM
    return hora;
  }

  // Método para obtener horario completo formateado
  getHorarioCompleto(): string {
    return `${this.diaSemana} a las ${this.formatHora(this.hora)}`;
  }

  // Método para obtener solo la hora formateada
  getHoraFormateada(): string {
    return this.formatHora(this.hora);
  }
}