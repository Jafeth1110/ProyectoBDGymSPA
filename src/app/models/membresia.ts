export class Membresia {
  constructor(
    public idMembresia: number = 0,
    public idCliente: number = 0,
    public nombre: string = '',
    public descripcion: string = '',
    public tipoMem: string = '',
    public precio: number = 0,
    public descuento: number = 0,
    public fechaVenc: string = '',
    public fechaInicio: string = '',
    public fechaCreacion: string = '',
    public estado: number = 1, // 1: Activa, 0: Inactiva
    public esPlantilla: number = 0, // 1: Es plantilla, 0: Es membresía de cliente
    // Nuevos campos para control de pagos
    public pagada: boolean = false, // Indica si la membresía está pagada
    public fechaUltimoPago: string = '', // Fecha del último pago registrado
    public requierePago: boolean = true, // Indica si la membresía requiere pago
    // Campos calculados (agregados por el backend)
    public estado_pago?: string, // 'Pagada', 'Pendiente de pago', o 'No aplica'
    public clienteInfo?: { // Información del cliente (opcional)
      idCliente: number;
      nombre: string;
      apellido: string;
      email: string;
    }
  ) {}

  // Método para validar los datos de la membresía (cliente)
  isValidCliente(): boolean {
    return this.idCliente > 0 && 
           this.tipoMem.trim() !== '' && 
           this.precio > 0 &&
           this.fechaVenc !== '' &&
           this.fechaInicio !== '' &&
           this.esPlantilla === 0;
  }

  // Método para validar los datos de la plantilla
  isValidPlantilla(): boolean {
    return this.nombre.trim() !== '' &&
           this.tipoMem.trim() !== '' && 
           this.precio > 0 &&
           this.esPlantilla === 1;
  }

  // Método para verificar si es una plantilla
  isPlantilla(): boolean {
    return this.esPlantilla === 1;
  }

  // Método para obtener el estado como texto
  getEstadoTexto(): string {
    if (this.esPlantilla === 1) {
      return this.estado === 1 ? 'Disponible' : 'No Disponible';
    }
    return this.estado === 1 ? 'Activa' : 'Inactiva';
  }

  // Método para cambiar el estado
  toggleEstado(): void {
    this.estado = this.estado === 1 ? 0 : 1;
  }

  // Método para calcular precio final con descuento
  getPrecioFinal(): number {
    if (this.descuento > 0) {
      return this.precio - (this.precio * this.descuento / 100);
    }
    return this.precio;
  }

  // Método para obtener el precio formateado
  getPrecioFormateado(): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(Number(this.precio));
  }

  // Método para obtener el precio final formateado
  getPrecioFinalFormateado(): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(Number(this.getPrecioFinal()));
  }

  // Método para obtener el descuento formateado
  getDescuentoFormateado(): string {
    return this.descuento > 0 ? `${this.descuento}%` : 'Sin descuento';
  }

  // Método para obtener el tipo de membresía formateado
  getTipoMemFormateado(): string {
    const tipos: { [key: string]: string } = {
      'Diaria': '1 día',
      'Semanal': '1 semana',
      'Quincenal': '15 días',
      'Mensual': '1 mes',
      'Trimestral': '3 meses',
      'Semestral': '6 meses',
      'Anual': '1 año'
    };
    return tipos[this.tipoMem] || this.tipoMem;
  }

  // Método para obtener fecha formateada
  getFechaFormateada(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método para verificar si está vencida
  isVencida(): boolean {
    if (!this.fechaVenc) return false;
    const hoy = new Date();
    const vencimiento = new Date(this.fechaVenc);
    return vencimiento < hoy;
  }

  // Método para obtener días restantes
  getDiasRestantes(): number {
    if (!this.fechaVenc) return 0;
    const hoy = new Date();
    const vencimiento = new Date(this.fechaVenc);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  // Método para obtener nombre completo del cliente (si está disponible)
  getNombreCliente(): string {
    if (this.clienteInfo) {
      return `${this.clienteInfo.nombre} ${this.clienteInfo.apellido}`;
    }
    return `Cliente #${this.idCliente}`;
  }

  // Método para obtener email del cliente (si está disponible)
  getEmailCliente(): string {
    return this.clienteInfo?.email || 'Email no disponible';
  }

  // Método para verificar si está pagada
  isPagada(): boolean {
    return this.pagada === true || (this.pagada as any) === 1;
  }

  // Método para obtener el estado de pago
  getEstadoPago(): string {
    if (this.estado_pago) {
      return this.estado_pago;
    }
    
    if (this.esPlantilla === 1) {
      return 'No aplica';
    }
    
    return this.isPagada() ? 'Pagada' : 'Pendiente de pago';
  }

  // Método para verificar si requiere pago
  requiereRegistroPago(): boolean {
    return this.requierePago === true || (this.requierePago as any) === 1;
  }

  // Método para obtener la fecha del último pago formateada
  getFechaUltimoPagoFormateada(): string {
    if (!this.fechaUltimoPago) return 'Sin pagos registrados';
    return this.getFechaFormateada(this.fechaUltimoPago);
  }

  // Método para obtener el color del badge según el estado de pago
  getEstadoPagoClass(): string {
    const estado = this.getEstadoPago();
    switch (estado) {
      case 'Pagada':
        return 'badge-success';
      case 'Pendiente de pago':
        return 'badge-warning';
      case 'No aplica':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  // Método para verificar si necesita pago urgente (vence pronto y no está pagada)
  necesitaPagoUrgente(): boolean {
    const diasRestantes = this.getDiasRestantes();
    return !this.isPagada() && diasRestantes <= 7 && diasRestantes > 0;
  }
}