import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InscripcionClaseService } from '../../services/inscripcionClase.service';
import { ClienteService } from '../../services/cliente.service';
import { ClaseService } from '../../services/clase.service';
import { InscripcionClase } from '../../models/inscripcionClase';
import { InscripcionClaseFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-inscripcionclase',
  templateUrl: './add-inscripcionclase.component.html',
  styleUrls: ['./add-inscripcionclase.component.css']
})
export class AddInscripcionClaseComponent implements OnInit {
  public inscripcion: InscripcionClase = new InscripcionClase();
  public clientes: any[] = [];
  public clases: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;

  constructor(
    private _inscripcionService: InscripcionClaseService,
    private _clienteService: ClienteService,
    private _claseService: ClaseService,
    private _router: Router
  ) {
    this.resetInscripcion();
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadClases();
  }

  resetInscripcion() {
    this.inscripcion = new InscripcionClase(0, 0, 0, new Date().toISOString().split('T')[0], 1);
  }

  loadClientes(): void {
    this._clienteService.getClientes().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clientes = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.showAlert('error', 'Error al cargar la lista de clientes');
      }
    });
  }

  loadClases(): void {
    this._claseService.getClases().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clases = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clases:', error);
        this.showAlert('error', 'Error al cargar la lista de clases');
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.inscripcion.idCliente || !this.inscripcion.idClase || !this.inscripcion.fechaInscripcion) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this.isLoading = true;

    const inscripcionData: InscripcionClaseFormData = {
      idCliente: this.inscripcion.idCliente,
      idClase: this.inscripcion.idClase,
      fechaInscripcion: this.inscripcion.fechaInscripcion,
      estado: this.inscripcion.estado
    };

    this._inscripcionService.addInscripcion(inscripcionData).subscribe({
      next: (response: any) => {
        if (response && response.status === 201) {
          this.showAlert('success', 'Inscripción creada correctamente', () => {
            this._router.navigate(['/show-inscripcionclase']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al crear la inscripción');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear inscripción:', error);
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
      this.showAlert('error', 'Error inesperado al crear la inscripción. Inténtalo de nuevo.');
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
    this._router.navigate(['/show-inscripcionclase']);
  }
}