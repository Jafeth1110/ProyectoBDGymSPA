import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { EntrenadorService } from '../../services/entrenador.service';
import { Clase } from '../../models/clase';
import { ClaseFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-clase',
  templateUrl: './add-clase.component.html',
  styleUrls: ['./add-clase.component.css']
})
export class AddClaseComponent implements OnInit {
  public clase: Clase = new Clase();
  public entrenadores: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;

  constructor(
    private _claseService: ClaseService,
    private _entrenadorService: EntrenadorService,
    private _router: Router
  ) {
    this.resetClase();
  }

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  resetClase() {
    this.clase = new Clase(0, '', '', 0, 0);
  }

  loadEntrenadores(): void {
    this.isLoading = true;
    this._entrenadorService.getEntrenadores().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.entrenadores = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar entrenadores:', error);
        this.showAlert('error', 'Error al cargar la lista de entrenadores');
        this.isLoading = false;
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validaciones básicas
    if (!this.clase.nombre || !this.clase.descripcion || 
        !this.clase.capacidad || !this.clase.idEntrenador) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // Validar que la capacidad sea un número positivo
    if (this.clase.capacidad <= 0) {
      this.showAlert('error', 'La capacidad debe ser mayor a 0.');
      return;
    }

    // Validar que se haya seleccionado un entrenador
    if (this.clase.idEntrenador <= 0) {
      this.showAlert('error', 'Debes seleccionar un entrenador válido.');
      return;
    }

    this.isLoading = true;

    const claseData: ClaseFormData = {
      nombre: this.clase.nombre.trim(),
      descripcion: this.clase.descripcion.trim(),
      capacidad: this.clase.capacidad,
      idEntrenador: this.clase.idEntrenador
    };

    this._claseService.addClase(claseData).subscribe({
      next: (response: any) => {
        if (response && response.status === 201) {
          this.showAlert('success', 'Clase creada correctamente', () => {
            this._router.navigate(['/show-clase']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al crear la clase');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear clase:', error);
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
      this.showAlert('error', 'Error inesperado al crear la clase. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-clase']);
  }
}