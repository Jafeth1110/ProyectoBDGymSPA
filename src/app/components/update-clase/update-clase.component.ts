import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { EntrenadorService } from '../../services/entrenador.service';
import { Clase } from '../../models/clase';
import { ClaseFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-clase',
  templateUrl: './update-clase.component.html',
  styleUrls: ['./update-clase.component.css']
})
export class UpdateClaseComponent implements OnInit {
  public clase: Clase = new Clase();
  public entrenadores: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public claseId: number = 0;

  constructor(
    private _claseService: ClaseService,
    private _entrenadorService: EntrenadorService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.claseId = Number(id);
        this.loadClase(this.claseId);
        this.loadEntrenadores();
      }
    });
  }

  loadClase(id: number): void {
    this.isLoading = true;
    this._claseService.getClase(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clase = this._claseService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Clase no encontrada');
          this._router.navigate(['/view-clase']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar clase:', error);
        this.showAlert('error', 'Error al cargar los datos de la clase');
        this._router.navigate(['/view-clase']);
        this.isLoading = false;
      }
    });
  }

  loadEntrenadores(): void {
    this._entrenadorService.getEntrenadores().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.entrenadores = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar entrenadores:', error);
        this.showAlert('error', 'Error al cargar la lista de entrenadores');
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.clase.nombre || !this.clase.descripcion || 
        !this.clase.capacidad || !this.clase.idEntrenador) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    if (this.clase.capacidad <= 0) {
      this.showAlert('error', 'La capacidad debe ser mayor a 0.');
      return;
    }

    this.isLoading = true;

    const claseData: ClaseFormData = {
      nombre: this.clase.nombre.trim(),
      descripcion: this.clase.descripcion.trim(),
      capacidad: this.clase.capacidad,
      idEntrenador: this.clase.idEntrenador
    };

    this._claseService.updateClase(this.claseId, claseData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response.status === 201)) {
          this.showAlert('success', 'Clase actualizada correctamente', () => {
            this._router.navigate(['/show-clase', this.claseId]);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar la clase');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar clase:', error);
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
      this.showAlert('error', 'Error inesperado al actualizar la clase. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-clase', this.claseId]);
  }
}