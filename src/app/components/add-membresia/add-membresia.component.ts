import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaFormData, PlantillaMembresiaFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-membresia',
  templateUrl: './add-membresia.component.html',
  styleUrls: ['./add-membresia.component.css']
})
export class AddMembresiaComponent {
  public formData: any = {};
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public tiposMembresia: string[] = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
  public clientes: any[] = [];
  public plantillas: any[] = [];
  public isLoadingClientes: boolean = false;
  public isLoadingPlantillas: boolean = false;
  public tipoCreacion: string = 'cliente'; // 'cliente' o 'plantilla'
  public plantillaSeleccionada: any = null;

  constructor(
    private _membresiaService: MembresiaService,
    private _clienteService: ClienteService,
    private _router: Router
  ) {
    this.resetFormData();
    this.loadClientes();
    this.loadPlantillas();
  }

  resetFormData() {
    this.formData = {
      idCliente: null,
      nombre: '',
      descripcion: '',
      tipoMem: '',
      precio: 0,
      descuento: 0,
      fechaInicio: '',
      fechaVenc: '',
      estado: 1,
      esPlantilla: this.tipoCreacion === 'plantilla'
    };
    
    // Establecer fecha de inicio como hoy para membresías de cliente
    if (this.tipoCreacion === 'cliente') {
      const hoy = new Date();
      this.formData.fechaInicio = hoy.toISOString().split('T')[0];
      
      // Si ya hay un tipo de membresía seleccionado, calcular la fecha de vencimiento
      if (this.formData.tipoMem) {
        this.calcularFechaVencimiento();
      } else {
        // Establecer fecha de vencimiento en 30 días por defecto
        const vencimiento = new Date();
        vencimiento.setDate(vencimiento.getDate() + 30);
        this.formData.fechaVenc = vencimiento.toISOString().split('T')[0];
      }
    }
  }

  // Método para calcular automáticamente la fecha de vencimiento basada en el tipo de membresía
  calcularFechaVencimiento(): void {
    if (!this.formData.fechaInicio || !this.formData.tipoMem || this.isPlantilla()) {
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
    if (!this.isPlantilla()) {
      this.calcularFechaVencimiento();
    }
  }

  // Método que se ejecuta cuando cambia la fecha de inicio
  onFechaInicioChange(): void {
    if (!this.isPlantilla()) {
      this.calcularFechaVencimiento();
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

  loadPlantillas(): void {
    this.isLoadingPlantillas = true;
    this._membresiaService.getPlantillas().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.plantillas = response.data;
        } else {
          this.plantillas = [];
        }
        this.isLoadingPlantillas = false;
      },
      error: (error: any) => {
        console.error('Error al cargar plantillas:', error);
        this.plantillas = [];
        this.isLoadingPlantillas = false;
      }
    });
  }

  onTipoCreacionChange(): void {
    this.resetFormData();
    this.plantillaSeleccionada = null;
    
    // Configurar fecha de inicio automáticamente para membresías de cliente
    if (this.tipoCreacion === 'cliente') {
      const hoy = new Date();
      this.formData.fechaInicio = hoy.toISOString().split('T')[0];
    }
  }

  onPlantillaSelect(): void {
    if (this.plantillaSeleccionada) {
      this.formData.nombre = this.plantillaSeleccionada.nombre;
      this.formData.descripcion = this.plantillaSeleccionada.descripcion;
      this.formData.tipoMem = this.plantillaSeleccionada.tipoMem;
      this.formData.precio = this.plantillaSeleccionada.precio;
      this.formData.descuento = this.plantillaSeleccionada.descuento || 0;
      
      // Calcular automáticamente la fecha de vencimiento si es una membresía de cliente
      if (!this.isPlantilla()) {
        this.calcularFechaVencimiento();
      }
    }
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validaciones según el tipo de creación
    if (this.tipoCreacion === 'plantilla') {
      // Validaciones para plantilla
      if (!this.formData.nombre?.trim()) {
        this.showAlert('error', 'Debes ingresar un nombre para la plantilla.');
        return;
      }
      
      if (!this.formData.tipoMem || !this.formData.precio) {
        this.showAlert('error', 'Debes completar tipo de membresía y precio.');
        return;
      }
    } else if (this.tipoCreacion === 'cliente') {
      // Validaciones para membresía de cliente
      if (this.plantillaSeleccionada) {
        // Usando plantilla existente
        if (!this.formData.idCliente || this.formData.idCliente <= 0) {
          this.showAlert('error', 'Debes seleccionar un cliente válido.');
          return;
        }
      } else {
        // Creación manual
        if (!this.formData.idCliente || this.formData.idCliente <= 0) {
          this.showAlert('error', 'Debes seleccionar un cliente válido.');
          return;
        }

        if (!this.formData.tipoMem || !this.formData.precio ||
            !this.formData.fechaInicio || !this.formData.fechaVenc) {
          this.showAlert('error', 'Debes completar todos los campos obligatorios.');
          return;
        }

        // Validar que la fecha de vencimiento sea posterior a la de inicio
        if (new Date(this.formData.fechaVenc) <= new Date(this.formData.fechaInicio)) {
          this.showAlert('error', 'La fecha de vencimiento debe ser posterior a la fecha de inicio.');
          return;
        }
      }
    }

    if (this.formData.precio <= 0) {
      this.showAlert('error', 'El precio debe ser mayor a 0.');
      return;
    }

    this.isLoading = true;

    // Ejecutar acción según el tipo
    if (this.tipoCreacion === 'plantilla') {
      this.crearPlantilla();
    } else if (this.plantillaSeleccionada) {
      this.asignarMembresiaDesdeTemplate();
    } else {
      this.crearMembresia();
    }
  }

  crearPlantilla(): void {
    const plantillaData: any = {
      nombre: this.formData.nombre.trim(),
      descripcion: this.formData.descripcion?.trim() || '',
      tipoMem: this.formData.tipoMem.trim(),
      precio: this.formData.precio,
      descuento: this.formData.descuento || 0,
      estado: this.formData.estado,
      esPlantilla: true
    };

    this._membresiaService.createPlantilla(plantillaData).subscribe({
      next: (response: any) => {
        if (response && (response.code === 201 || response.status === 'success')) {
          this.showAlert('success', 'Plantilla de membresía creada correctamente', () => {
            this._router.navigate(['/view-membresia']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al crear la plantilla de membresía');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear plantilla:', error);
        this.handleErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  asignarMembresiaDesdeTemplate(): void {
    const asignacionData = {
      idCliente: this.formData.idCliente,
      idPlantilla: this.plantillaSeleccionada.idMembresia,
      fechaInicio: this.formData.fechaInicio,
      fechaVenc: this.formData.fechaVenc,
      precio: this.formData.precio || this.plantillaSeleccionada.precio,
      descuento: this.formData.descuento || this.plantillaSeleccionada.descuento || 0
    };

    this._membresiaService.asignarMembresiaCliente(asignacionData).subscribe({
      next: (response: any) => {
        if (response && (response.code === 201 || response.status === 'success')) {
          this.showAlert('success', 'Membresía asignada correctamente', () => {
            this._router.navigate(['/view-membresia']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al asignar la membresía');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al asignar membresía:', error);
        this.handleErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  crearMembresia(): void {
    const membresiaData: MembresiaFormData = {
      idCliente: this.formData.idCliente,
      tipoMem: this.formData.tipoMem.trim(),
      precio: this.formData.precio,
      fechaInicio: this.formData.fechaInicio,
      fechaVenc: this.formData.fechaVenc,
      estado: this.formData.estado
    };

    // Campos opcionales
    if (this.formData.nombre) {
      (membresiaData as any).nombre = this.formData.nombre.trim();
    }
    
    if (this.formData.descripcion) {
      (membresiaData as any).descripcion = this.formData.descripcion.trim();
    }

    if (this.formData.descuento && this.formData.descuento > 0) {
      (membresiaData as any).descuento = this.formData.descuento;
    }

    this._membresiaService.addMembresia(membresiaData).subscribe({
      next: (response: any) => {
        if (response && (response.code === 201 || response.status === 'success')) {
          this.showAlert('success', 'Membresía creada correctamente', () => {
            this._router.navigate(['/view-membresia']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al crear la membresía');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear membresía:', error);
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
      this.showAlert('error', 'Error inesperado. Inténtalo de nuevo.');
    }
  }

  // Utilidades para el template
  isPlantilla(): boolean {
    return this.tipoCreacion === 'plantilla';
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
    this._router.navigate(['/view-membresia']);
  }
}