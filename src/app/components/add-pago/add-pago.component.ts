import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaService } from '../../services/membresia.service';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { Pago } from '../../models/pago';
import { PagoFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-pago',
  templateUrl: './add-pago.component.html',
  styleUrls: ['./add-pago.component.css']
})
export class AddPagoComponent implements OnInit {
  public pago: Pago = new Pago();
  public clientes: any[] = [];
  public membresias: any[] = [];
  public metodosPago: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;

  constructor(
    private _pagoService: PagoService,
    private _clienteService: ClienteService,
    private _membresiaService: MembresiaService,
    private _metodoPagoService: MetodoPagoService,
    private _router: Router
  ) {
    this.resetPago();
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadMembresias();
    this.loadMetodosPago();
  }

  resetPago() {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const vencimiento = nextMonth.toISOString().split('T')[0];
    
    this.pago = new Pago(0, 0, 0, 0, 0, today, vencimiento, 'Pendiente', '', '');
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
          this.membresias = response.data.filter((m: any) => m.estado === 1); // Solo activas
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
          this.metodosPago = response.data.filter((mp: any) => mp.activo === 1); // Solo activos
        }
      },
      error: (error: any) => {
        console.error('Error al cargar métodos de pago:', error);
        this.showAlert('error', 'Error al cargar la lista de métodos de pago');
      }
    });
  }

  onMembresiaChange(): void {
    if (this.pago.idMembresia) {
      const membresia = this.membresias.find(m => m.idMembresia === this.pago.idMembresia);
      if (membresia) {
        this.pago.monto = membresia.precio;
      }
    }
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.pago.idCliente || !this.pago.idMembresia || 
        !this.pago.idMetodoPago || !this.pago.monto || 
        !this.pago.fechaPago || !this.pago.fechaVencimiento) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    if (this.pago.monto <= 0) {
      this.showAlert('error', 'El monto debe ser mayor a 0.');
      return;
    }

    // Validar fechas
    const fechaPago = new Date(this.pago.fechaPago);
    const fechaVencimiento = new Date(this.pago.fechaVencimiento);
    
    if (fechaVencimiento < fechaPago) {
      this.showAlert('error', 'La fecha de vencimiento no puede ser anterior a la fecha de pago.');
      return;
    }

    this.isLoading = true;

    const pagoData: PagoFormData = {
      idCliente: this.pago.idCliente,
      idMembresia: this.pago.idMembresia,
      idMetodoPago: this.pago.idMetodoPago,
      monto: this.pago.monto,
      fechaPago: this.pago.fechaPago,
      fechaVencimiento: this.pago.fechaVencimiento,
      estado: this.pago.estado,
      referencia: this.pago.referencia || '',
      notas: this.pago.notas || ''
    };

    this._pagoService.addPago(pagoData).subscribe({
      next: (response: any) => {
        if (response && response.status === 201) {
          this.showAlert('success', 'Pago registrado correctamente', () => {
            this._router.navigate(['/show-pago']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al registrar el pago');
        }
        this.isLoading = false;
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
    this._router.navigate(['/show-pago']);
  }
}