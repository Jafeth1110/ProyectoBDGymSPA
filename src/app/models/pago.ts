export class Pago {
  constructor(
    public idPago: number = 0,
    public idCliente: number = 0,
    public idMembresia: number = 0,
    public idMetodoPago: number = 0,
    public monto: number = 0,
    public fechaPago: string = '',
    public fechaVencimiento: string = '',
    public estado: string = 'Pendiente', // Pendiente, Completado, Cancelado
    public referencia: string = '',
    public notas: string = '',
    public cliente?: {
      idCliente: number;
      nombre: string;
      apellido: string;
      email: string;
    },
    public membresia?: {
      idMembresia: number;
      tipoMem: string;
      precio: number;
      fechaVenc: string;
      fechaInicio: string;
    },
    public metodoPago?: {
      idMetodoPago: number;
      nombre: string;
      comision: number;
    }
  ) {}

  // Método para validar los datos del pago
  isValid(): boolean {
    return this.idCliente > 0 && 
           this.idMembresia > 0 && 
           this.idMetodoPago > 0 &&
           this.monto > 0 &&
           this.fechaPago.trim() !== '';
  }

  // Método para obtener el nombre completo del cliente
  getNombreCliente(): string {
    if (this.cliente) {
      return `${this.cliente.nombre} ${this.cliente.apellido}`;
    }
    return '';
  }

  // Método para obtener el monto formateado
  getMontoFormateado(): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(this.monto);
  }

  // Método para obtener el estado con clase CSS
  getEstadoClass(): string {
    switch (this.estado.toLowerCase()) {
      case 'completado':
        return 'badge-success';
      case 'pendiente':
        return 'badge-warning';
      case 'cancelado':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  // Método para verificar si el pago está vencido
  isVencido(): boolean {
    if (!this.fechaVencimiento) return false;
    const hoy = new Date();
    const vencimiento = new Date(this.fechaVencimiento);
    return vencimiento < hoy && this.estado !== 'Completado';
  }

  // Método para calcular días hasta el vencimiento
  getDiasHastaVencimiento(): number {
    if (!this.fechaVencimiento) return 0;
    const hoy = new Date();
    const vencimiento = new Date(this.fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }
}