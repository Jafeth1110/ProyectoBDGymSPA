import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { Clase } from '../../models/clase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-clase',
  templateUrl: './add-clase.component.html',
  styleUrls: ['./add-clase.component.css']
})
export class AddClaseComponent {
  public clase: Clase = new Clase(0, '', '', '', '', 0);
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public diasSemana: string[] = Clase.getDiasValidos();

  constructor(
    private _claseService: ClaseService,
    private _router: Router
  ) {
    this.resetClase();
  }

  resetClase() {
    this.clase = new Clase(0, '', '', '', '', 0);
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validaciones básicas
    if (!this.clase.diaSemana || !this.clase.hora || !this.clase.nombre || !this.clase.descripcion || !this.clase.cupoMax) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // Validar que el cupo máximo sea un número positivo
    if (this.clase.cupoMax <= 0) {
      this.showAlert('error', 'El cupo máximo debe ser un número mayor a cero.');
      return;
    }

    // Validar día de la semana
    if (!this.diasSemana.includes(this.clase.diaSemana)) {
      this.showAlert('error', 'Debe seleccionar un día de la semana válido.');
      return;
    }

    // Validar horario (formato básico HH:MM)
    const horarioRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(this.clase.hora)) {
      this.showAlert('error', 'El horario debe tener formato HH:MM (ejemplo: 14:30).');
      return;
    }

    // Enviar clase directamente
    this.isLoading = true;
    this._claseService.addClase(this.clase).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('Respuesta exitosa completa:', res);
        
        // El backend responde con res.code y res.status, no res.status como HTTP status
        if (res.code === 200 || res.code === 201 || res.status === 'success') {
          if (form) form.reset();
          this.resetClase();
          this.showAlert('success', res.message || 'Clase registrada correctamente.');
          // Pequeño delay para que se vea la alerta antes de navegar
          setTimeout(() => {
            this._router.navigate(['/view-clase']);
          }, 1500);
        } else {
          console.log('Respuesta no exitosa:', res);
          this.showAlert('error', res.message || 'No se pudo registrar la clase.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error completo:', err);
        
        // Manejar errores específicos de la base de datos
        let errorMessage = 'Error inesperado del servidor.';
        
        if (err.error?.message) {
          const message = err.error.message;
          
          // Detectar errores de conflicto (código 409)
          if (err.status === 409 || err.error?.code === 409) {
            errorMessage = message; // Usar el mensaje específico del backend
          } else {
            errorMessage = message;
          }
        }
        
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors = Object.values(err.error.errors).flat() as string[];
        }
        
        this.showAlert('error', errorMessage);
      }
    });
  }

  showAlert(type: 'success' | 'error', message: string) {
    const config: any = {
      title: type === 'success' ? '¡Éxito!' : '¡Error!',
      html: message.replace(/\n/g, '<br>'), // Convertir saltos de línea a HTML
      icon: type,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: type === 'success' ? '#28a745' : '#dc3545',
      timer: type === 'success' ? 3000 : undefined,
      showConfirmButton: type === 'error' ? true : false
    };

    Swal.fire(config);
  }

  goBack(): void {
    this._router.navigate(['/view-clase']);
  }
}
