import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-equipo',
  templateUrl: './add-equipo.component.html',
  styleUrls: ['./add-equipo.component.css'],
  providers: [EquipoService]
})
export class AddEquipoComponent {
  public equipo: Equipo = new Equipo();
  public validationErrors: string[] = [];

  constructor(
    private _equipoService: EquipoService,
    private _router: Router
  ) {}

  onSubmit(form?: any): void {
    this.validationErrors = [];
    if (
      !this.equipo.nombre ||
      !this.equipo.tipo ||
      this.equipo.estado == null ||
      this.equipo.cantidad == null
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this._equipoService.storeEquipo(this.equipo).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Equipo registrado correctamente');
          this._router.navigate(['/view-equipo']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el equipo');
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
    this._router.navigate(['/view-equipo']);
  }
}
