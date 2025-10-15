export class Membresia {
  constructor(
    public idMembresia: number = 0,
    public tipo: string = '',
    public precio: number = 0,
    public duracionMeses: number = 0,
    public descripcion: string = '',
    public estado: number = 1, // 1: Activa, 0: Inactiva
    public beneficios?: string[]
  ) {}

  // Método para validar los datos de la membresía
  isValid(): boolean {
    return this.tipo.trim() !== '' && 
           this.precio > 0 && 
           this.duracionMeses > 0;
  }

  // Método para obtener el estado como texto
  getEstadoTexto(): string {
    return this.estado === 1 ? 'Activa' : 'Inactiva';
  }

  // Método para cambiar el estado
  toggleEstado(): void {
    this.estado = this.estado === 1 ? 0 : 1;
  }

  // Método para obtener el precio formateado
  getPrecioFormateado(): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(this.precio);
  }

  // Método para obtener la duración formateada
  getDuracionFormateada(): string {
    return this.duracionMeses === 1 ? '1 mes' : `${this.duracionMeses} meses`;
  }
}