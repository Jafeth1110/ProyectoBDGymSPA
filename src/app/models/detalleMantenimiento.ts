export class DetalleMantenimiento {
  constructor(
    public idDetalleMantenimiento: number = 0,
    public idAdmin: number = 0,
    public idEquipo: number = 0,
    public idMantenimiento: number = 0,
    public fechaMantenimiento: string = '', // formato 'YYYY-MM-DD'
    // Nuevos campos para control de pagos
    public pagado: boolean = false, // Indica si el mantenimiento está pagado
    public fechaPago: string = '', // Fecha en que se realizó el pago
    // Campo calculado (agregado por el backend)
    public estado_pago?: string // 'Pagado' o 'Pendiente de pago'
  ) {}

  // Método para verificar si está pagado
  isPagado(): boolean {
    return this.pagado === true || (this.pagado as any) === 1;
  }

  // Método para obtener el estado de pago
  getEstadoPago(): string {
    if (this.estado_pago) {
      return this.estado_pago;
    }
    return this.isPagado() ? 'Pagado' : 'Pendiente de pago';
  }

  // Método para obtener el color del badge según el estado de pago
  getEstadoPagoClass(): string {
    return this.isPagado() ? 'badge-success' : 'badge-warning';
  }

  // Método para obtener la fecha de pago formateada
  getFechaPagoFormateada(): string {
    if (!this.fechaPago) return 'Sin pago registrado';
    const fechaObj = new Date(this.fechaPago);
    return fechaObj.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para obtener la fecha de mantenimiento formateada
  getFechaMantenimientoFormateada(): string {
    if (!this.fechaMantenimiento) return '';
    const fechaObj = new Date(this.fechaMantenimiento);
    return fechaObj.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método para verificar si el mantenimiento es reciente (último mes)
  esReciente(): boolean {
    if (!this.fechaMantenimiento) return false;
    const fechaMant = new Date(this.fechaMantenimiento);
    const hoy = new Date();
    const unMesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    return fechaMant >= unMesAtras;
  }
}
