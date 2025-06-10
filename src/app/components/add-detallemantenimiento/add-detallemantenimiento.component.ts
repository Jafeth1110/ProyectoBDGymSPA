import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-detallemantenimiento',
  templateUrl: './add-detallemantenimiento.component.html',
  styleUrls: ['./add-detallemantenimiento.component.css'],
  providers: [DetalleMantenimientoService]
})
export class AddDetallemantenimientoComponent {
  public detalle: DetalleMantenimiento = new DetalleMantenimiento();
  public validationErrors: string[] = [];

  constructor(
    private _detalleService: DetalleMantenimientoService,
    private _router: Router
  ) {}

  onSubmit(form?: any): void {
    this.validationErrors = [];
    
    if (
      !this.detalle.idAdmin ||
      !this.detalle.idEquipo ||
      !this.detalle.idMantenimiento ||
      !this.detalle.fechaMantenimiento
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this._detalleService.storeDetalle(this.detalle).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Detalle de mantenimiento registrado correctamente');
          this._router.navigate(['/view-detallemantenimiento']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el detalle');
        }
      },
      error: (error: any) => {
        if (error.status === 400 && error.error && error.error.message) {
          this.showAlert('error', error.error.message);
        } else if (error.status === 422 && error.error && error.error.errors) {
          const errors: string[] = [];
          Object.keys(error.error.errors).forEach(field => {
            const fieldErrors: string[] = error.error.errors[field];
            fieldErrors.forEach(msg => errors.push(msg));
          });
          this.validationErrors = errors;
          this.showAlert('error', errors.join('<br>'));
        } else {
          this.showAlert('error', 'Error inesperado del servidor.');
        }
      }
    });
  }

  showAlert(type: 'success' | 'error', message: string) {
    Swal.fire({
      title: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false
    });
  }

  back(): void {
    this._router.navigate(['/view-detallemantenimiento']);
  }
}