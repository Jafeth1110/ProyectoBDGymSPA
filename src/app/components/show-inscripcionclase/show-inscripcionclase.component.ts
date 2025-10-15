import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InscripcionClaseService } from '../../services/inscripcionClase.service';
import { InscripcionClase } from '../../models/inscripcionClase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-inscripcionclase',
  templateUrl: './show-inscripcionclase.component.html',
  styleUrls: ['./show-inscripcionclase.component.css']
})
export class ShowInscripcionClaseComponent implements OnInit {
  public inscripcion: InscripcionClase | null = null;
  public isLoading: boolean = false;

  constructor(
    private _inscripcionService: InscripcionClaseService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadInscripcion(Number(id));
      }
    });
  }

  loadInscripcion(id: number): void {
    this.isLoading = true;
    this._inscripcionService.getInscripcion(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.inscripcion = this._inscripcionService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Inscripción no encontrada');
          this._router.navigate(['/view-inscripcionclase']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener inscripción:', error);
        this.showAlert('error', 'Error al obtener los datos de la inscripción');
        this._router.navigate(['/view-inscripcionclase']);
        this.isLoading = false;
      }
    });
  }

  editInscripcion(): void {
    if (this.inscripcion) {
      this._router.navigate(['/update-inscripcionclase', this.inscripcion.idInscripcionClase]);
    }
  }

  deleteInscripcion(): void {
    if (!this.inscripcion) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar esta inscripción?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.inscripcion) {
        this._inscripcionService.deleteInscripcion(this.inscripcion.idInscripcionClase).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Inscripción eliminada correctamente', () => {
              this._router.navigate(['/view-inscripcionclase']);
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar inscripción:', error);
            this.showAlert('error', 'Error al eliminar la inscripción');
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-inscripcionclase']);
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
}