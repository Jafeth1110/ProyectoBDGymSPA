export class Pago {
  constructor(
    // Datos principales del pago
    public idPago: number = 0,
    public fechaPago: string = '',
    public monto: number = 0,
    
    // Nuevos campos para el sistema híbrido
    public tipoPago: 'membresia' | 'mantenimiento' = 'membresia',
    public descripcion: string = '',
    
    // IDs de relaciones (condicionales según tipoPago)
    public idMembresia: number = 0,
    public idMetodoPago: number = 0,
    public idDetalleMantenimiento: number = 0,
    
    // Datos de la membresía (solo para tipoPago = 'membresia')
    public tipoMem: string = '',
    public membresia_precio: number = 0,
    public fechaVenc: string = '',
    public fechaInicio: string = '',
    public membresia_estado: number = 1,
    
    // Datos del método de pago
    public metodoPago_nombre: string = '',
    public metodoPago_descripcion: string = '',
    public metodoPago_comision: number = 0,
    public metodoPago_requiereAutorizacion: number = 0,
    public metodoPago_estado: number = 1,
    
    // Datos del cliente (solo para tipoPago = 'membresia')
    public idCliente: number = 0,
    public cliente_nombre: string = '',
    public cliente_apellido: string = '',
    public cliente_email: string = '',
    
    // Datos del mantenimiento (solo para tipoPago = 'mantenimiento')
    public equipo_nombre: string = '',
    public equipo_tipo: string = '',
    public mantenimiento_tipo: string = '',
    public mantenimiento_descripcion: string = '',
    
    // Datos del admin (para pagos de mantenimiento)
    public idAdmin: number = 0,
    public admin_nombre: string = '',
    public admin_apellido: string = '',
    public admin_email: string = ''
  ) {}

  // Método para validar los datos del pago
  isValid(): boolean {
    const baseValid = this.idMetodoPago > 0 && 
                     this.monto > 0 && 
                     this.fechaPago.trim() !== '' &&
                     (this.tipoPago === 'membresia' || this.tipoPago === 'mantenimiento');
    
    if (this.tipoPago === 'membresia') {
      return baseValid && this.idMembresia > 0;
    } else if (this.tipoPago === 'mantenimiento') {
      return baseValid && this.idDetalleMantenimiento > 0;
    }
    
    return false;
  }

  // Método para verificar si es pago de membresía
  esPagoMembresia(): boolean {
    return this.tipoPago === 'membresia';
  }

  // Método para verificar si es pago de mantenimiento
  esPagoMantenimiento(): boolean {
    return this.tipoPago === 'mantenimiento';
  }

  // Método para obtener el nombre descriptivo del pago
  getNombreDescriptivo(): string {
    if (this.esPagoMembresia()) {
      return this.getNombreCliente() || 'Cliente sin nombre';
    } else {
      return this.equipo_nombre || this.mantenimiento_descripcion || 'Mantenimiento';
    }
  }

  // Método para obtener el nombre completo del cliente (solo para membresías)
  getNombreCliente(): string {
    if (this.cliente_nombre && this.cliente_apellido) {
      return `${this.cliente_nombre} ${this.cliente_apellido}`;
    }
    return '';
  }

  // Método para obtener el nombre completo del admin (solo para mantenimientos)
  getNombreAdmin(): string {
    if (this.admin_nombre && this.admin_apellido) {
      return `${this.admin_nombre} ${this.admin_apellido}`;
    }
    return 'Admin del Sistema';
  }

  // Método para obtener el monto formateado con signo
  getMontoFormateado(): string {
    const signo = this.esPagoMembresia() ? '+' : '-';
    return `${signo} ${new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(this.monto)}`;
  }

  // Método para obtener el tipo de membresía o tipo de mantenimiento
  getTipoMembresia(): string {
    if (this.esPagoMembresia()) {
      return this.tipoMem || '';
    } else {
      return this.mantenimiento_tipo || 'Mantenimiento';
    }
  }

  // Método para obtener el nombre del método de pago
  getNombreMetodoPago(): string {
    return this.metodoPago_nombre || '';
  }

  // Método para obtener la comisión aplicada
  getComisionAplicada(): number {
    const comision = this.metodoPago_comision || 0;
    return (this.monto * comision) / 100;
  }

  // Método para obtener el monto neto (después de comisión)
  getMontoNeto(): number {
    return this.monto - this.getComisionAplicada();
  }

  // Método para verificar si el pago es del mes actual
  esDeMesActual(): boolean {
    const fechaPago = new Date(this.fechaPago);
    const hoy = new Date();
    return fechaPago.getMonth() === hoy.getMonth() && 
           fechaPago.getFullYear() === hoy.getFullYear();
  }

  // Método para obtener la clase CSS según el tipo de pago
  getTipoClass(): string {
    return this.esPagoMembresia() ? 'ingreso' : 'gasto';
  }

  // Método para obtener el icono según el tipo de pago
  getTipoIcono(): string {
    return this.esPagoMembresia() ? '💰' : '🔧';
  }
}