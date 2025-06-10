import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-mantenimiento',
  templateUrl: './add-mantenimiento.component.html',
  styleUrls: ['./add-mantenimiento.component.css'],
  providers: [MantenimientoService]
})
export class AddMantenimientoComponent {
  public mantenimiento: Mantenimiento = new Mantenimiento();
  public validationErrors: string[] = [];

  constructor(
    private _mantenimientoService: MantenimientoService,
    private _router: Router
  ) {}

  onSubmit(form?: any): void {
    this.validationErrors = [];
    if (
      !this.mantenimiento.descripcion ||
      this.mantenimiento.costo == null
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this._mantenimientoService.storeMantenimiento(this.mantenimiento).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Mantenimiento registrado correctamente');
          this._router.navigate(['/view-mantenimiento']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el mantenimiento');
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
    this._router.navigate(['/view-mantenimiento']);
  }
}
