import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-equipo',
  templateUrl: './update-equipo.component.html',
  styleUrls: ['./update-equipo.component.css'],
  providers: [EquipoService]
})
export class UpdateEquipoComponent implements OnInit {
  public equipo: Equipo = new Equipo();
  public validationErrors: string[] = [];

  constructor(
    private _equipoService: EquipoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEquipo(id);
      }
    });
  }

  loadEquipo(id: number): void {
    this._equipoService.showEquipo(id).subscribe(
      response => {
        if (response?.equipo) {
          const e = response.equipo;
          this.equipo = new Equipo(
            e.idEquipo,
            e.nombre,
            e.tipo,
            e.estado,
            e.cantidad
          );
        } else {
          this.showAlert('error', 'Equipo no encontrado');
          this._router.navigate(['/view-equipo']);
        }
      },
      error => {
        this.showAlert('error', 'Error al obtener los datos del equipo');
        this._router.navigate(['/view-equipo']);
      }
    );
  }

  updateEquipo(form?: any): void {
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

    const dataToSend = {
      nombre: this.equipo.nombre,
      tipo: this.equipo.tipo,
      estado: this.equipo.estado,
      cantidad: this.equipo.cantidad
    };

    this._equipoService.updateEquipo(this.equipo.idEquipo,  dataToSend ).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.showAlert('success', 'Equipo actualizado correctamente');
          this._router.navigate(['/view-equipo']);
        } else {
          this.showAlert('error', response.message || 'No se pudo actualizar el equipo');
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
    this._router.navigate(['/view-equipo']);
  }
}
