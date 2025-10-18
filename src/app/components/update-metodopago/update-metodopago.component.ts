import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { MetodoPago } from '../../models/metodoPago';
import { MetodoPagoFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-metodopago',
  templateUrl: './update-metodopago.component.html',
  styleUrls: ['./update-metodopago.component.css']
})
export class UpdateMetodopagoComponent implements OnInit {
  public metodoPago: MetodoPago = new MetodoPago();
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public metodoPagoId: number = 0;

  constructor(
    private _metodoPagoService: MetodoPagoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.metodoPagoId = Number(id);
        this.loadMetodoPago(this.metodoPagoId);
      }
    });
  }

  loadMetodoPago(id: number): void {
    this.isLoading = true;
    this._metodoPagoService.getMetodoPago(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.metodoPago = this._metodoPagoService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Método de pago no encontrado');
          this._router.navigate(['/view-metodopago']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar método de pago:', error);
        this.showAlert('error', 'Error al cargar los datos del método de pago');
        this._router.navigate(['/view-metodopago']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.metodoPago.nombre.trim()) {
      this.showAlert('error', 'El nombre del método de pago es obligatorio.');
      return;
    }

    if (this.metodoPago.nombre.trim().length > 45) {
      this.showAlert('error', 'El nombre no puede exceder 45 caracteres.');
      return;
    }

    if (this.metodoPago.descripcion && this.metodoPago.descripcion.trim().length > 100) {
      this.showAlert('error', 'La descripción no puede exceder 100 caracteres.');
      return;
    }

    if (this.metodoPago.comision < 0 || this.metodoPago.comision > 100) {
      this.showAlert('error', 'La comisión debe estar entre 0 y 100.');
      return;
    }

    this.isLoading = true;

    const metodoPagoData: MetodoPagoFormData = {
      nombre: this.metodoPago.nombre.trim(),
      descripcion: this.metodoPago.descripcion.trim(),
      estado: this.metodoPago.estado,
      requiereAutorizacion: this.metodoPago.requiereAutorizacion,
      comision: this.metodoPago.comision
    };

    this._metodoPagoService.updateMetodoPago(this.metodoPagoId, metodoPagoData).subscribe({
      next: (response: any) => {
        if (response && (response.code === 200 || response.status === 'success')) {
          this.showAlert('success', response.message || 'Método de pago actualizado correctamente', () => {
            this._router.navigate(['/view-metodopago']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar el método de pago');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar método de pago:', error);
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
      this.showAlert('error', 'Error inesperado al actualizar el método de pago. Inténtalo de nuevo.');
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
    this._router.navigate(['/view-metodopago']);
  }
}