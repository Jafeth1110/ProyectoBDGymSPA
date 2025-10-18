import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaResponse, MembresiaFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-membresia',
  templateUrl: './update-membresia.component.html',
  styleUrls: ['./update-membresia.component.css']
})
export class UpdateMembresiaComponent implements OnInit {
  public membresia: MembresiaResponse | null = null;
  public formData: any = {};
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public membresiaId: number = 0;
  public tiposMembresia: string[] = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
  public clientes: any[] = [];
  public isLoadingClientes: boolean = false;
  public clienteActual: any = null; // Información del cliente actual si existe
  public puedeEditarCliente: boolean = false; // Si se puede cambiar el cliente

  constructor(
    private _membresiaService: MembresiaService,
    private _clienteService: ClienteService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.membresiaId = Number(id);
        this.loadMembresia(this.membresiaId);
        // Solo cargar clientes si va a ser necesario
        // Se cargará dinámicamente cuando se habilite la edición
      }
    });
  }

  loadMembresia(id: number): void {
    this.isLoading = true;
    this._membresiaService.getMembresia(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.membresia = response.data;
          this.initializeFormData();
        } else {
          this.showAlert('error', 'Membresía no encontrada');
          this._router.navigate(['/view-membresia']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar membresía:', error);
        this.showAlert('error', 'Error al cargar los datos de la membresía');
        this._router.navigate(['/view-membresia']);
        this.isLoading = false;
      }
    });
  }

  initializeFormData(): void {
    if (this.membresia) {
      // Convertir esPlantilla a boolean correctamente
      const esPlantillaValue = String(this.membresia.esPlantilla) === "1";

      // Asegurar que el estado sea siempre un entero (0 o 1)
      const estadoNumber = parseInt(String(this.membresia.estado), 10);

      this.formData = {
        idCliente: this.membresia.idCliente ? Number(this.membresia.idCliente) : null,
        nombre: this.membresia.nombre || '',
        descripcion: this.membresia.descripcion || '',
        tipoMem: this.membresia.tipoMem || '',
        precio: Number(this.membresia.precio) || 0,
        descuento: Number(this.membresia.descuento) || 0,
        fechaInicio: this.membresia.fechaInicio || '',
        fechaVenc: this.membresia.fechaVenc || '',
        estado: estadoNumber,
        esPlantilla: esPlantillaValue
      };

      // Configurar información del cliente actual - revisar si NO es plantilla Y tiene cliente
      if (this.membresia.idCliente && !esPlantillaValue) {
        this.clienteActual = {
          idCliente: Number(this.membresia.idCliente),
          nombre: this.membresia.cliente_nombre || 'Sin nombre',
          apellido: this.membresia.cliente_apellido || '',
          email: this.membresia.cliente_email || 'Sin email'
        };
        this.puedeEditarCliente = false;
      } else {
        this.clienteActual = null;
        this.puedeEditarCliente = esPlantillaValue;
      }
    }
  }

  loadClientes(): void {
    this.isLoadingClientes = true;
    this._clienteService.getClientes().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clientes = response.data;
        } else {
          this.clientes = [];
        }
        this.isLoadingClientes = false;
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = [];
        this.isLoadingClientes = false;
      }
    });
  }

  // Método para calcular automáticamente la fecha de vencimiento basada en el tipo de membresía
  calcularFechaVencimiento(): void {
    if (!this.formData.fechaInicio || !this.formData.tipoMem || this.formData.esPlantilla) {
      return;
    }

    const fechaInicio = new Date(this.formData.fechaInicio);
    const fechaVencimiento = new Date(fechaInicio);

    switch (this.formData.tipoMem.toLowerCase()) {
      case 'diaria':
        fechaVencimiento.setDate(fechaInicio.getDate() + 1);
        break;
      case 'semanal':
        fechaVencimiento.setDate(fechaInicio.getDate() + 7);
        break;
      case 'quincenal':
        fechaVencimiento.setDate(fechaInicio.getDate() + 15);
        break;
      case 'mensual':
        fechaVencimiento.setMonth(fechaInicio.getMonth() + 1);
        break;
      case 'trimestral':
        fechaVencimiento.setMonth(fechaInicio.getMonth() + 3);
        break;
      case 'semestral':
        fechaVencimiento.setMonth(fechaInicio.getMonth() + 6);
        break;
      case 'anual':
        fechaVencimiento.setFullYear(fechaInicio.getFullYear() + 1);
        break;
      default:
        // Por defecto, 30 días
        fechaVencimiento.setDate(fechaInicio.getDate() + 30);
        break;
    }

    this.formData.fechaVenc = fechaVencimiento.toISOString().split('T')[0];
  }

  // Método que se ejecuta cuando cambia el tipo de membresía
  onTipoMembresiaChange(): void {
    if (!this.formData.esPlantilla) {
      this.calcularFechaVencimiento();
    }
  }

  // Método que se ejecuta cuando cambia la fecha de inicio
  onFechaInicioChange(): void {
    if (!this.formData.esPlantilla) {
      this.calcularFechaVencimiento();
    }
  }

  // Método para manejar el cambio del select de estado y asegurar que sea número
  onEstadoChange(event: any): void {
    const valor = event.target.value;
    this.formData.estado = parseInt(valor, 10);
  }

  // Método para manejar el cambio de cliente (solo cuando se permite editar)
  onClienteChange(): void {
    if (this.puedeEditarCliente && this.formData.idCliente && this.formData.idCliente > 0) {
      // Si se selecciona un cliente, convertir a membresía de cliente
      this.formData.esPlantilla = false;
      
      // Actualizar información del cliente actual
      const clienteSeleccionado = this.clientes.find(c => c.id == this.formData.idCliente);
      if (clienteSeleccionado) {
        this.clienteActual = {
          idCliente: clienteSeleccionado.id,
          nombre: clienteSeleccionado.nombre,
          apellido: clienteSeleccionado.apellido,
          email: clienteSeleccionado.email
        };
      }
      
      // Si no hay fecha de inicio, poner la fecha actual
      if (!this.formData.fechaInicio) {
        const today = new Date();
        this.formData.fechaInicio = today.toISOString().split('T')[0];
      }
      
      // Calcular fecha de vencimiento automáticamente
      this.calcularFechaVencimiento();
      
      // Ya no se puede cambiar el cliente una vez seleccionado
      this.puedeEditarCliente = false;
    }
  }

  // Método para convertir a plantilla
  convertirAPlantilla(): void {
    this.formData.esPlantilla = true;
    this.formData.idCliente = null;
    this.formData.fechaInicio = '';
    this.formData.fechaVenc = '';
    
    // Limpiar información del cliente actual
    this.clienteActual = null;
    this.puedeEditarCliente = false;
  }

  // Método para habilitar la edición de cliente (solo para plantillas)
  habilitarEdicionCliente(): void {
    if (this.formData.esPlantilla) {
      this.puedeEditarCliente = true;
      // Cargar clientes si no están cargados
      if (this.clientes.length === 0) {
        this.loadClientes();
      }
    }
  }



  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.membresia) {
      this.showAlert('error', 'No se han cargado los datos de la membresía.');
      return;
    }

    // Si no es plantilla, debe tener cliente (usar cliente actual si existe)
    if (!this.formData.esPlantilla) {
      const clienteId = this.clienteActual ? this.clienteActual.idCliente : this.formData.idCliente;
      if (!clienteId || clienteId <= 0) {
        this.showAlert('error', 'Debe tener un cliente asignado para membresías de cliente.');
        return;
      }
      // Asegurar que se use el ID correcto
      this.formData.idCliente = clienteId;
    }

    // Validaciones básicas
    if (!this.formData.tipoMem || this.formData.precio === undefined || this.formData.precio === null) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    if (this.formData.precio <= 0) {
      this.showAlert('error', 'El precio debe ser mayor a 0.');
      return;
    }



    // Validar fechas solo si no es plantilla
    if (!this.formData.esPlantilla) {
      if (!this.formData.fechaInicio || !this.formData.fechaVenc) {
        this.showAlert('error', 'Las fechas son obligatorias para membresías de cliente.');
        return;
      }

      if (new Date(this.formData.fechaVenc) <= new Date(this.formData.fechaInicio)) {
        this.showAlert('error', 'La fecha de vencimiento debe ser posterior a la fecha de inicio.');
        return;
      }
    }



    this.isLoading = true;

    const membresiaData: any = {
      tipoMem: this.formData.tipoMem.trim(),
      precio: Number(this.formData.precio),
      estado: parseInt(String(this.formData.estado), 10), // Forzar conversión a entero
      esPlantilla: this.formData.esPlantilla ? 1 : 0
    };

    // Si no es plantilla, agregar datos de cliente y fechas
    if (!this.formData.esPlantilla) {
      membresiaData.idCliente = this.formData.idCliente;
      membresiaData.fechaInicio = this.formData.fechaInicio;
      membresiaData.fechaVenc = this.formData.fechaVenc;
    } else {
      // Si es plantilla, asegurarse de que no se envíen datos de cliente
      membresiaData.idCliente = null;
      membresiaData.fechaInicio = null;
      membresiaData.fechaVenc = null;
    }

    // Campos opcionales
    if (this.formData.nombre) {
      membresiaData.nombre = this.formData.nombre.trim();
    }
    
    if (this.formData.descripcion) {
      membresiaData.descripcion = this.formData.descripcion.trim();
    }

    if (this.formData.descuento && this.formData.descuento > 0) {
      membresiaData.descuento = this.formData.descuento;
    }

    this._membresiaService.updateMembresia(this.membresiaId, membresiaData).subscribe({
      next: (response: any) => {
        if (response && (response.code === 200 || response.status === 'success')) {
          this.showAlert('success', 'Membresía actualizada correctamente', () => {
            this._router.navigate(['/show-membresia', this.membresiaId]);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar la membresía');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar membresía:', error);
        this.handleErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  // Utilidades para el template
  isPlantilla(): boolean {
    return this.formData.esPlantilla || false;
  }

  isActiva(): boolean {
    return Number(this.formData.estado) === 1;
  }

  getEstadoTexto(): string {
    const estado = Number(this.formData.estado);
    if (this.isPlantilla()) {
      return estado === 1 ? 'Disponible' : 'No Disponible';
    } else {
      return estado === 1 ? 'Activa' : 'Inactiva';
    }
  }

  getEstadoDescripcion(): string {
    const estado = Number(this.formData.estado);
    if (this.isPlantilla()) {
      return estado === 1 ? 
        'La plantilla se puede usar para crear nuevas membresías' : 
        'La plantilla no está disponible para uso';
    } else {
      return estado === 1 ? 
        'La membresía está vigente y funcional' : 
        'La membresía no está activa';
    }
  }

  toggleEstado(): void {
    const estadoActual = parseInt(String(this.formData.estado), 10);
    this.formData.estado = estadoActual === 1 ? 0 : 1;
  }

  // Método para activar directamente
  activarMembresia(): void {
    this.formData.estado = 1;
  }

  // Método para desactivar directamente
  desactivarMembresia(): void {
    this.formData.estado = 0;
  }

  getPrecioFormateado(precio: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getPrecioFinal(): number {
    const precio = this.formData.precio || 0;
    const descuento = this.formData.descuento || 0;
    return precio - (precio * descuento / 100);
  }

  // Método para verificar si el estado ha cambiado
  hasEstadoChanged(): boolean {
    if (!this.membresia) return false;
    return Number(this.membresia.estado) !== Number(this.formData.estado);
  }

  // Método para obtener información sobre los cambios
  getChangesInfo(): string[] {
    const changes: string[] = [];
    
    if (!this.membresia) return changes;

    if (this.membresia.nombre !== this.formData.nombre) {
      changes.push('Nombre');
    }
    
    if (Number(this.membresia.precio) !== this.formData.precio) {
      changes.push('Precio');
    }
    
    if (Number(this.membresia.descuento || 0) !== (this.formData.descuento || 0)) {
      changes.push('Descuento');
    }
    
    if (this.hasEstadoChanged()) {
      changes.push(`Estado (${this.getEstadoTexto()})`);
    }

    return changes;
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
      this.showAlert('error', 'Error inesperado al actualizar la membresía. Inténtalo de nuevo.');
    }
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string, callback?: () => void, timeout?: number): void {
    const config: any = {
      title: type === 'success' ? '¡Éxito!' : type === 'error' ? '¡Error!' : type === 'warning' ? '¡Atención!' : '¡Información!',
      text: message,
      icon: type,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#28a745'
    };

    if (type === 'error') {
      config.confirmButtonColor = '#dc3545';
    } else if (type === 'warning') {
      config.confirmButtonColor = '#ffc107';
    } else if (type === 'info') {
      config.confirmButtonColor = '#17a2b8';
    }

    // Si hay timeout, usar toast
    if (timeout) {
      config.toast = true;
      config.position = 'top-end';
      config.timer = timeout;
      config.showConfirmButton = false;
      config.timerProgressBar = true;
    }

    Swal.fire(config).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  navigateToViewMembresias(): void {
    this._router.navigate(['/view-membresia']);
  }

  goBack(): void {
    this._router.navigate(['/show-membresia', this.membresiaId]);
  }

}