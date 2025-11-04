import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-equipo',
  templateUrl: './show-equipo.component.html',
  styleUrls: ['./show-equipo.component.css'],
  providers: [EquipoService]
})
export class ShowEquipoComponent implements OnInit {
  public equipo: Equipo | null = null;
  public isLoading: boolean = false;

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
    this.isLoading = true;
    this._equipoService.showEquipo(id).subscribe(
      response => {
        this.isLoading = false;
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
        this.isLoading = false;
        console.error('Error al obtener equipo:', error);
        this.showAlert('error', 'Error al obtener los datos del equipo');
        this._router.navigate(['/view-equipo']);
      }
    );
  }

  getEstadoTexto(estado: number | string): string {
    const e = Number(estado); // <-- convierte string a number
    if (e === 1) return 'Bueno';
    if (e === 0) return 'Malo';
    return 'Desconocido';
  }

  editEquipo(): void {
    if (this.equipo) {
      this._router.navigate(['/update-equipo', this.equipo.idEquipo]);
    }
  }

  deleteEquipo(): void {
    if (!this.equipo) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el equipo "${this.equipo.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.equipo) {
        this._equipoService.deleteEquipo(this.equipo.idEquipo).subscribe(
          response => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El equipo ha sido eliminado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this._router.navigate(['/view-equipo']);
          },
          error => {
            console.error('Error al eliminar equipo:', error);
            this.showAlert('error', 'Error al eliminar el equipo');
          }
        );
      }
    });
  }

  showAlert(type: 'error', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    });
  }

  back(): void {
    this._router.navigate(['/view-equipo']);
  }
}
