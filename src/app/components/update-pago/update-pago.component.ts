import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaService } from '../../services/membresia.service';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { Pago } from '../../models/pago';
import { PagoFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-pago',
  templateUrl: './update-pago.component.html',
  styleUrls: ['./update-pago.component.css']
})
export class UpdatePagoComponent implements OnInit {
  public pago: Pago = new Pago();
  public clientes: any[] = [];
  public membresias: any[] = [];
  public metodosPago: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public pagoId: number = 0;

  constructor(
    private _pagoService: PagoService,
    private _clienteService: ClienteService,
    private _membresiaService: MembresiaService,
    private _metodoPagoService: MetodoPagoService,
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

  loadPago(id: number): void {
    this.isLoading = true;
    this._pagoService.getPago(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.pago = this._pagoService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Pago no encontrado');
          this._router.navigate(['/view-pago']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar pago:', error);
        this.showAlert('error', 'Error al cargar los datos del pago');
        this._router.navigate(['/view-pago']);
        this.isLoading = false;
      }
    });
  }

  loadRelatedData(): void {
    this._clienteService.getClientes().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clientes = response.data;
        }
      },
      error: (error: any) => console.error('Error al cargar clientes:', error)
    });

    this._membresiaService.getMembresias().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.membresias = response.data;
        }
      },
      error: (error: any) => console.error('Error al cargar membresías:', error)
    });

    this._metodoPagoService.getMetodosPago().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.metodosPago = response.data;
        }
      },
      error: (error: any) => console.error('Error al cargar métodos de pago:', error)
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.pago.idCliente || !this.pago.idMembresia || !this.pago.idMetodoPago ||
        !this.pago.monto || !this.pago.fechaPago || !this.pago.fechaVencimiento ||
        !this.pago.estado || !this.pago.referencia) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    if (this.pago.monto <= 0) {
      this.showAlert('error', 'El monto debe ser mayor a 0.');
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
      referencia: this.pago.referencia.trim(),
      notas: this.pago.notas?.trim() || ''
    };

    this._pagoService.updatePago(this.pagoId, pagoData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response.status === 201)) {
          this.showAlert('success', 'Pago actualizado correctamente', () => {
            this._router.navigate(['/show-pago', this.pagoId]);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar el pago');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar pago:', error);
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
      this.showAlert('error', 'Error inesperado al actualizar el pago. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-pago', this.pagoId]);
  }
}