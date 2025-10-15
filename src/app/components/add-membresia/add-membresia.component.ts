import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import { MembresiaFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-membresia',
  templateUrl: './add-membresia.component.html',
  styleUrls: ['./add-membresia.component.css']
})
export class AddMembresiaComponent {
  public membresia: Membresia = new Membresia();
  public validationErrors: string[] = [];
  public isLoading: boolean = false;

  constructor(
    private _membresiaService: MembresiaService,
    private _router: Router
  ) {
    this.resetMembresia();
  }

  resetMembresia() {
    this.membresia = new Membresia(0, '', 0, 0, '', 1);
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.membresia.tipo || !this.membresia.precio || 
        !this.membresia.duracionMeses || !this.membresia.descripcion) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    if (this.membresia.precio <= 0) {
      this.showAlert('error', 'El precio debe ser mayor a 0.');
      return;
    }

    if (this.membresia.duracionMeses <= 0) {
      this.showAlert('error', 'La duración debe ser mayor a 0 meses.');
      return;
    }

    this.isLoading = true;

    const membresiaData: MembresiaFormData = {
      tipo: this.membresia.tipo.trim(),
      precio: this.membresia.precio,
      duracionMeses: this.membresia.duracionMeses,
      descripcion: this.membresia.descripcion.trim(),
      estado: this.membresia.estado,
      beneficios: this.membresia.beneficios
    };

    this._membresiaService.addMembresia(membresiaData).subscribe({
      next: (response: any) => {
        if (response && response.status === 201) {
          this.showAlert('success', 'Membresía creada correctamente', () => {
            this._router.navigate(['/show-membresia']);
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
      this.showAlert('error', 'Error inesperado al crear la membresía. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-membresia']);
  }
}