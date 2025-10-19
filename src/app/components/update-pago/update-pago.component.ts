import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaService } from '../../services/membresia.service';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { PagoFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-pago',
  templateUrl: './update-pago.component.html',
  styleUrls: ['./update-pago.component.css']
})
export class UpdatePagoComponent implements OnInit {
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
  public pagoId: number = 0;
  public originalPago: any = null;
  
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
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.pagoId = Number(id);
        this.loadPago(this.pagoId);
        this.loadRelatedData();
      }
    });
  }

  // Getter para obtener la fecha máxima permitida (hoy)
  get maxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadPago(id: number): void {
    this.isLoading = true;
    this._pagoService.getPago(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalPago = response.data;
          
          // Determinar el tipo de pago basado en qué ID está presente
          let tipoPago: 'membresia' | 'mantenimiento' = 'membresia'; // por defecto
          if (response.data.idDetalleMantenimiento && response.data.idDetalleMantenimiento > 0) {
            tipoPago = 'mantenimiento';
          }
          
          this.pagoForm = {
            tipoPago: tipoPago,
            idMembresia: response.data.idMembresia || 0,
            idMetodoPago: response.data.idMetodoPago,
            idDetalleMantenimiento: response.data.idDetalleMantenimiento || 0,
            fechaPago: response.data.fechaPago,
            monto: response.data.monto,
            descripcion: response.data.descripcion || ''
          };
          
          // Después de cargar el pago, cargar los datos relacionados y luego calcular montos
          this.loadRelatedData();
        } else {
          this.showAlert('error', 'Pago no encontrado');
          this._router.navigate(['/view-pago']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener pago:', error);
        this.showAlert('error', 'Error al obtener los datos del pago');
        this._router.navigate(['/view-pago']);
        this.isLoading = false;
      }
    });
  }

  loadRelatedData(): void {
    this.loadClientes();
    this.loadMembresias();
    this.loadMetodosPago();
    this.loadDetallesMantenimiento();
    
    // Después de cargar todos los datos, esperar un poco y recalcular montos
    setTimeout(() => {
      this.recalculateAmounts();
    }, 1000);
  }
  
  // Método para recalcular montos basado en el pago cargado
  recalculateAmounts(): void {
    if (this.pagoForm.tipoPago === 'membresia' && this.pagoForm.idMembresia) {
      this.onMembresiaChange();
    } else if (this.pagoForm.tipoPago === 'mantenimiento' && this.pagoForm.idDetalleMantenimiento) {
      this.onDetalleMantenimientoChange();
    }
    
    // Aplicar comisión del método de pago si está seleccionado
    if (this.pagoForm.idMetodoPago) {
      this.onMetodoPagoChange();
    }
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
          this.membresias = response.data.filter((m: any) => {
            const estadoActivo = m.estado == 1 || m.estado === '1';
            const tieneCliente = m.idCliente && m.idCliente !== null && m.idCliente !== '' && Number(m.idCliente) > 0;
            return estadoActivo && tieneCliente;
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar membresías:', error);
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

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validación condicional según tipo de pago
    let camposIncompletos = false;
    
    if (this.pagoForm.tipoPago === 'membresia') {
      if (!this.pagoForm.idMembresia || !this.pagoForm.idMetodoPago || 
          !this.pagoForm.monto || !this.pagoForm.fechaPago) {
        camposIncompletos = true;
      }
      
      // Verificar que la membresía seleccionada existe
      const membresiaExiste = this.membresias.find(m => m.idMembresia == this.pagoForm.idMembresia);
      if (!membresiaExiste && this.pagoForm.idMembresia != this.originalPago?.idMembresia) {
        this.showAlert('error', 'La membresía seleccionada no existe o no está disponible. Por favor selecciona una membresía válida.');
        return;
      }
    } else if (this.pagoForm.tipoPago === 'mantenimiento') {
      if (!this.pagoForm.idDetalleMantenimiento || !this.pagoForm.idMetodoPago || 
          !this.pagoForm.monto || !this.pagoForm.fechaPago) {
        camposIncompletos = true;
      }
      
      // Verificar que el detalle de mantenimiento seleccionado existe
      const detalleExiste = this.detallesMantenimiento.find(d => d.idDetalleMantenimiento == this.pagoForm.idDetalleMantenimiento);
      if (!detalleExiste && this.pagoForm.idDetalleMantenimiento != this.originalPago?.idDetalleMantenimiento) {
        this.showAlert('error', 'El detalle de mantenimiento seleccionado no existe o no está disponible. Por favor selecciona un detalle válido.');
        return;
      }
    }
    
    if (camposIncompletos) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    // Verificar que el método de pago existe
    const metodoPagoExiste = this.metodosPago.find(mp => mp.idMetodoPago == this.pagoForm.idMetodoPago);
    if (!metodoPagoExiste) {
      this.showAlert('error', 'El método de pago seleccionado no existe o no está disponible.');
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

    // Limpiar campos no necesarios según el tipo de pago
    const pagoData = { ...this.pagoForm };
    if (pagoData.tipoPago === 'membresia') {
      pagoData.idDetalleMantenimiento = 0;
    } else if (pagoData.tipoPago === 'mantenimiento') {
      pagoData.idMembresia = 0;
    }

    this.isLoading = true;

    this._pagoService.updatePago(this.pagoId, pagoData).subscribe({
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
          (response.message && response.message.toLowerCase().includes('actualizado'))
        )) {
          this.showAlert('success', 'Pago actualizado correctamente', () => {
            this._router.navigate(['/view-pago']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar el pago');
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar pago:', error);
        let errorMessage = 'Error al actualizar el pago';
        
        // Extraer mensaje de error más específico si está disponible
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showAlert('error', errorMessage);
        this.isLoading = false;
      }
    });
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

  getSelectedMembresiaInfo(): any {
    if (this.pagoForm.idMembresia) {
      return this.membresias.find(m => m.idMembresia === this.pagoForm.idMembresia);
    }
    return null;
  }

  getSelectedMetodoPagoInfo(): any {
    if (this.pagoForm.idMetodoPago) {
      return this.metodosPago.find(mp => mp.idMetodoPago === this.pagoForm.idMetodoPago);
    }
    return null;
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

  // Método para obtener el nombre del cliente
  getClienteNombre(idCliente: string): string {
    if (!idCliente || !this.clientes.length) return `Cliente ID: ${idCliente}`;
    
    const cliente = this.clientes.find(c => c.idCliente === idCliente || c.idCliente === Number(idCliente));
    if (cliente) {
      return `${cliente.nombre} ${cliente.apellido}`;
    }
    return `Cliente ID: ${idCliente}`;
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

  // Verificar si un detalle de mantenimiento existe en la lista actual
  getDetalleMantenimientoExiste(idDetalleMantenimiento: number): boolean {
    return this.detallesMantenimiento.some(d => d.idDetalleMantenimiento == idDetalleMantenimiento);
  }

  // Verificar si una membresía existe en la lista actual
  getMembresiaExiste(idMembresia: number): boolean {
    return this.membresias.some(m => m.idMembresia == idMembresia);
  }
}