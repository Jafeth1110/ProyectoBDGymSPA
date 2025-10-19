import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaService } from '../../services/membresia.service';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { Pago } from '../../models/pago';
import { PagoFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-pago',
  templateUrl: './add-pago.component.html',
  styleUrls: ['./add-pago.component.css']
})
export class AddPagoComponent implements OnInit {
  public pagoForm: PagoFormData = {
    tipoPago: 'membresia',
    idMembresia: 0,
    idDetalleMantenimiento: 0,
    idMetodoPago: 0,
    fechaPago: '',
    monto: 0,
    descripcion: ''
  };
  public membresias: any[] = [];
  public detallesMantenimiento: any[] = [];
  public metodosPago: any[] = [];
  public clientes: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  
  // Campos calculados para mostrar
  public descuentoAplicado: number = 0;
  public comisionAplicada: number = 0;
  public montoBase: number = 0;

  constructor(
    private _pagoService: PagoService,
    private _membresiaService: MembresiaService,
    private _metodoPagoService: MetodoPagoService,
    private _detalleMantenimientoService: DetalleMantenimientoService,
    private _clienteService: ClienteService,
    private _router: Router
  ) {
    this.resetPago();
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadMembresias();
    this.loadMetodosPago();
    this.loadDetallesMantenimiento();
  }

  resetPago() {
    const today = new Date().toISOString().split('T')[0];
    
    this.pagoForm = {
      tipoPago: 'membresia',
      idMembresia: 0,
      idDetalleMantenimiento: 0,
      idMetodoPago: 0,
      fechaPago: today,
      monto: 0,
      descripcion: ''
    };
  }

  // Getter para obtener la fecha máxima permitida (hoy)
  get maxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadClientes(): void {
    this._clienteService.getClientes().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clientes = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.showAlert('error', 'Error al cargar la lista de clientes');
      }
    });
  }

  loadMembresias(): void {
    this._membresiaService.getMembresias().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // Filtrar solo membresías activas que tengan cliente asignado
          this.membresias = response.data.filter((m: any) => {
            const estadoActivo = m.estado == 1 || m.estado === '1';
            const tieneCliente = m.idCliente && m.idCliente !== null && m.idCliente !== '' && Number(m.idCliente) > 0;
            return estadoActivo && tieneCliente;
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar membresías:', error);
        this.showAlert('error', 'Error al cargar la lista de membresías');
      }
    });
  }

  loadMetodosPago(): void {
    this._metodoPagoService.getMetodosPago().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.metodosPago = response.data.filter((mp: any) => mp.estado == 1 || mp.estado === '1');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar métodos de pago:', error);
        this.showAlert('error', 'Error al cargar la lista de métodos de pago');
      }
    });
  }

  onMembresiaChange(): void {
    // Resetear valores calculados
    this.descuentoAplicado = 0;
    this.comisionAplicada = 0;
    this.montoBase = 0;
    
    if (this.pagoForm.idMembresia) {
      const membresia = this.membresias.find(m => m.idMembresia == this.pagoForm.idMembresia);
      if (membresia) {
        this.montoBase = Number(membresia.precio) || 0;
        
        // Aplicar descuento si existe
        if (membresia.descuento && Number(membresia.descuento) > 0) {
          const descuentoPorcentaje = Number(membresia.descuento);
          this.descuentoAplicado = (this.montoBase * descuentoPorcentaje) / 100;
        }
        
        const montoConDescuento = this.montoBase - this.descuentoAplicado;
        this.pagoForm.monto = montoConDescuento;
        
        // Recalcular con comisión del método de pago si está seleccionado
        this.calculateFinalAmount();
      }
    } else {
      this.pagoForm.monto = 0;
    }
  }

  // Método para manejar cambio de método de pago
  onMetodoPagoChange(): void {
    this.calculateFinalAmount();
  }

  // Método para calcular el monto final con comisión
  calculateFinalAmount(): void {
    // Resetear comisión
    this.comisionAplicada = 0;
    
    if (!this.pagoForm.idMetodoPago) {
      return; // No hay método de pago seleccionado
    }

    const metodoPago = this.metodosPago.find(mp => mp.idMetodoPago == this.pagoForm.idMetodoPago);
    if (!metodoPago) {
      return; // Método de pago no encontrado
    }

    let montoBase = this.pagoForm.monto || 0;
    
    // Si hay comisión, aplicarla
    if (metodoPago.comision && Number(metodoPago.comision) > 0) {
      const comisionPorcentaje = Number(metodoPago.comision);
      this.comisionAplicada = (montoBase * comisionPorcentaje) / 100;
      const montoFinal = montoBase + this.comisionAplicada;
      
      this.pagoForm.monto = montoFinal;
    }
  }

  // Método para calcular monto de detalle de mantenimiento
  onDetalleMantenimientoChange(): void {
    // Resetear valores calculados
    this.descuentoAplicado = 0;
    this.comisionAplicada = 0;
    this.montoBase = 0;
    
    if (this.pagoForm.idDetalleMantenimiento) {
      const detalle = this.detallesMantenimiento.find(d => d.idDetalleMantenimiento == this.pagoForm.idDetalleMantenimiento);
      if (detalle) {
        this.montoBase = Number(detalle.mantenimientoCosto) || 0;
        this.pagoForm.monto = this.montoBase;
        
        // Recalcular con comisión del método de pago si está seleccionado
        this.calculateFinalAmount();
      }
    } else {
      this.pagoForm.monto = 0;
    }
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validación condicional según tipo de pago
    let camposIncompletos = false;
    
    if (this.pagoForm.tipoPago === 'membresia') {
      if (!this.pagoForm.idMembresia || !this.pagoForm.idMetodoPago || 
          !this.pagoForm.monto || !this.pagoForm.fechaPago) {
        camposIncompletos = true;
      }
    } else if (this.pagoForm.tipoPago === 'mantenimiento') {
      if (!this.pagoForm.idDetalleMantenimiento || !this.pagoForm.idMetodoPago || 
          !this.pagoForm.monto || !this.pagoForm.fechaPago) {
        camposIncompletos = true;
      }
    }
    
    if (camposIncompletos) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    if (this.pagoForm.monto <= 0) {
      this.showAlert('error', 'El monto debe ser mayor a 0.');
      return;
    }

    // Validar fecha
    const fechaPago = new Date(this.pagoForm.fechaPago);
    const hoy = new Date();
    
    if (fechaPago > hoy) {
      this.showAlert('error', 'La fecha de pago no puede ser futura.');
      return;
    }

    this.isLoading = true;

    this._pagoService.addPago(this.pagoForm).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Verificar si la respuesta indica éxito
        if (response && (
          response.status === 201 || 
          response.status === 200 || 
          response.code === 201 || 
          response.code === 200 ||
          (response.message && response.message.toLowerCase().includes('correcto')) ||
          (response.message && response.message.toLowerCase().includes('exitoso')) ||
          (response.message && response.message.toLowerCase().includes('registrado'))
        )) {
          this.showAlert('success', 'Pago registrado correctamente', () => {
            this._router.navigate(['/view-pago']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al registrar el pago');
        }
      },
      error: (error: any) => {
        console.error('Error al crear pago:', error);
        this.handleErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  private handleErrorResponse(error: any): void {
    if (error.error && error.error.errors) {
      const errors = error.error.errors;
      this.validationErrors = [];
      
      for (const field in errors) {
        if (Array.isArray(errors[field])) {
          this.validationErrors.push(...errors[field]);
        } else {
          this.validationErrors.push(errors[field]);
        }
      }
      
      this.showAlert('error', 'Errores de validación: ' + this.validationErrors.join(', '));
    } else if (error.error && error.error.message) {
      this.showAlert('error', error.error.message);
    } else if (error.message) {
      this.showAlert('error', error.message);
    } else {
      this.showAlert('error', 'Error inesperado al registrar el pago. Inténtalo de nuevo.');
    }
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string, callback?: () => void): void {
    const config: any = {
      title: type === 'success' ? '¡Éxito!' : type === 'error' ? '¡Error!' : '¡Atención!',
      text: message,
      icon: type,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#28a745'
    };

    if (type === 'error') {
      config.confirmButtonColor = '#dc3545';
    }

    Swal.fire(config).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-pago']);
  }

  // Método para obtener información de la membresía seleccionada
  getSelectedMembresiaInfo(): any {
    if (this.pagoForm.idMembresia) {
      return this.membresias.find(m => m.idMembresia === this.pagoForm.idMembresia);
    }
    return null;
  }

  // Método para obtener información del método de pago seleccionado
  getSelectedMetodoPagoInfo(): any {
    if (this.pagoForm.idMetodoPago) {
      return this.metodosPago.find(mp => mp.idMetodoPago === this.pagoForm.idMetodoPago);
    }
    return null;
  }

  // Método que se ejecuta cuando cambia el tipo de pago
  onTipoPagoChange(): void {
    // Resetear campos condicionales
    this.pagoForm.idMembresia = 0;
    this.pagoForm.idDetalleMantenimiento = 0;
    this.pagoForm.monto = 0;
    
    // Resetear valores calculados
    this.descuentoAplicado = 0;
    this.comisionAplicada = 0;
    this.montoBase = 0;
  }

  // Cargar detalles de mantenimiento pendientes de pago
  loadDetallesMantenimiento(): void {
    this._detalleMantenimientoService.getDetalles().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // Los detalles de mantenimiento están disponibles para pago
          this.detallesMantenimiento = response.data;
        } else {
          this.detallesMantenimiento = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar detalles de mantenimiento:', error);
        this.detallesMantenimiento = [];
      }
    });
  }

  // Método para obtener el nombre del cliente
  getClienteNombre(idCliente: string): string {
    if (!idCliente || !this.clientes.length) return `Cliente ID: ${idCliente}`;
    
    const cliente = this.clientes.find(c => c.idCliente === idCliente || c.idCliente === Number(idCliente));
    if (cliente) {
      return `${cliente.nombre} ${cliente.apellido}`;
    }
    return `Cliente ID: ${idCliente}`;
  }
}