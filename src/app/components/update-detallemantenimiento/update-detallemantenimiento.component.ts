import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-detallemantenimiento',
  templateUrl: './update-detallemantenimiento.component.html',
  styleUrls: ['./update-detallemantenimiento.component.css'],
  providers: [DetalleMantenimientoService]
})
export class UpdateDetallemantenimientoComponent implements OnInit {
  public detalle: DetalleMantenimiento = new DetalleMantenimiento();
  public validationErrors: string[] = [];

  constructor(
    private _detalleService: DetalleMantenimientoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadDetalle(id);
      }
    });
  }

  loadDetalle(id: number): void {
    this._detalleService.showDetalle(id).subscribe(
      response => {
        if (response?.detalle) {
          const d = response.detalle;
          // Formatear la fecha para el input type="date"
          const fechaFormateada = d.fechaMantenimiento ? new Date(d.fechaMantenimiento).toISOString().split('T')[0] : '';
          
          this.detalle = new DetalleMantenimiento(
            d.idDetalleMantenimiento,
            d.idAdmin,
            d.idEquipo,
            d.idMantenimiento,
            fechaFormateada
          );
        } else {
          this.showAlert('error', 'Detalle no encontrado');
          this._router.navigate(['/view-detallemantenimiento']);
        }
      },
      error => {
        this.showAlert('error', 'Error al obtener los datos del detalle');
        this._router.navigate(['/view-detallemantenimiento']);
      }
    );
  }

  updateDetalle(form?: any): void {
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

    const dataToSend = {
      idAdmin: this.detalle.idAdmin,
      idEquipo: this.detalle.idEquipo,
      idMantenimiento: this.detalle.idMantenimiento,
      fechaMantenimiento: this.detalle.fechaMantenimiento
    };

    this._detalleService.updateDetalle(this.detalle.idDetalleMantenimiento, { data: dataToSend }).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.showAlert('success', 'Detalle actualizado correctamente');
          this._router.navigate(['/view-detallemantenimiento']);
        } else {
          this.showAlert('error', response.message || 'No se pudo actualizar el detalle');
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

  cancel(): void {
    this._router.navigate(['/view-detallemantenimiento']);
  }
}