import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import { MembresiaFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-membresia',
  templateUrl: './update-membresia.component.html',
  styleUrls: ['./update-membresia.component.css']
})
export class UpdateMembresiaComponent implements OnInit {
  public membresia: Membresia = new Membresia();
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public membresiaId: number = 0;

  constructor(
    private _membresiaService: MembresiaService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.membresiaId = Number(id);
        this.loadMembresia(this.membresiaId);
      }
    });
  }

  loadMembresia(id: number): void {
    this.isLoading = true;
    this._membresiaService.getMembresia(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.membresia = this._membresiaService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Membresía no encontrada');
          this._router.navigate(['/view-membresia']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar membresía:', error);
        this.showAlert('error', 'Error al cargar los datos de la membresía');
        this._router.navigate(['/view-membresia']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.membresia.tipo || !this.membresia.precio || 
        !this.membresia.duracionMeses || !this.membresia.descripcion || 
        this.membresia.estado === undefined) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    if (this.membresia.precio <= 0 || this.membresia.duracionMeses <= 0) {
      this.showAlert('error', 'El precio y la duración deben ser mayores a 0.');
      return;
    }

    this.isLoading = true;

    const membresiaData: MembresiaFormData = {
      tipo: this.membresia.tipo.trim(),
      precio: this.membresia.precio,
      duracionMeses: this.membresia.duracionMeses,
      descripcion: this.membresia.descripcion.trim(),
      estado: this.membresia.estado
    };

    this._membresiaService.updateMembresia(this.membresiaId, membresiaData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response.status === 201)) {
          this.showAlert('success', 'Membresía actualizada correctamente', () => {
            this._router.navigate(['/show-membresia', this.membresiaId]);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al actualizar la membresía');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar membresía:', error);
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
      this.showAlert('error', 'Error inesperado al actualizar la membresía. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-membresia', this.membresiaId]);
  }
}