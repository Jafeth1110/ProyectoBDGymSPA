import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { Clase } from '../../models/clase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-clase',
  templateUrl: './update-clase.component.html',
  styleUrls: ['./update-clase.component.css']
})
export class UpdateClaseComponent implements OnInit {
  public clase: Clase = new Clase();
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public claseId: number = 0;
  public diasSemana: string[] = Clase.getDiasValidos();

  constructor(
    private _claseService: ClaseService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.claseId = Number(id);
        this.loadClase(this.claseId);
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

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.clase.nombre || !this.clase.descripcion || !this.clase.diaSemana || !this.clase.hora || !this.clase.cupoMax) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    if (this.clase.cupoMax <= 0) {
      this.showAlert('error', 'El cupo máximo debe ser mayor a 0.');
      return;
    }

    // Validar día de la semana
    if (!this.diasSemana.includes(this.clase.diaSemana)) {
      this.showAlert('error', 'Debe seleccionar un día de la semana válido.');
      return;
    }

    // Validar formato de hora
    const horarioRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(this.clase.hora)) {
      this.showAlert('error', 'La hora debe tener formato HH:MM (ejemplo: 14:30).');
      return;
    }

    this.isLoading = true;

    const claseData = {
      nombre: this.clase.nombre.trim(),
      descripcion: this.clase.descripcion.trim(),
      diaSemana: this.clase.diaSemana,
      hora: this.clase.hora,
      cupoMax: this.clase.cupoMax
    };

    this._claseService.updateClase(this.claseId, claseData).subscribe({
      next: (response: any) => {
        console.log('Respuesta de actualización:', response);
        
        // El backend responde con response.code y response.status, no response.status como HTTP status
        if (response && (response.code === 200 || response.code === 201 || response.status === 'success')) {
          this.showAlert('success', response.message || 'Clase actualizada correctamente', () => {
            this._router.navigate(['/view-clase']);
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
    let errorMessage = 'Error inesperado del servidor.';
    
    // Manejar errores de validación (422)
    if (error.status === 422 && error.error?.errors) {
      const errors = error.error.errors;
      this.validationErrors = [];
      
      for (const field in errors) {
        if (Array.isArray(errors[field])) {
          this.validationErrors.push(...errors[field]);
        } else {
          this.validationErrors.push(errors[field]);
        }
      }
      
      errorMessage = 'Errores de validación: ' + this.validationErrors.join(', ');
    }
    // Manejar errores de conflicto (409) - nuevas validaciones del backend
    else if (error.status === 409 || error.error?.code === 409) {
      errorMessage = error.error?.message || 'Conflicto con los datos existentes.';
    }
    // Manejar otros errores con mensaje
    else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    // Manejar errores genéricos
    else if (error.message) {
      errorMessage = error.message;
    }
    
    this.showAlert('error', errorMessage);
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
    this._router.navigate(['/view-clase']);
  }
}