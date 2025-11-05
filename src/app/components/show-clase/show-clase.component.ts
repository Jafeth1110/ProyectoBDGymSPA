import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { Clase } from '../../models/clase';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-show-clase',
  templateUrl: './show-clase.component.html',
  styleUrls: ['./show-clase.component.css']
})
export class ShowClaseComponent implements OnInit {
  public clase: Clase | null = null;
  public isLoading: boolean = false;
  public isClient: boolean = false;
  public isTrainer: boolean = false;

  constructor(
    private _claseService: ClaseService,
    private _route: ActivatedRoute,
    private _router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isClient = this.auth.getCurrentUserRole() === 'cliente';
    this.isTrainer = this.auth.getCurrentUserRole() === 'entrenador';
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadClase(Number(id));
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
        console.error('Error al obtener clase:', error);
        this.showAlert('error', 'Error al obtener los datos de la clase');
        this._router.navigate(['/view-clase']);
        this.isLoading = false;
      }
    });
  }

  editClase(): void {
    if (this.clase) {
      this._router.navigate(['/update-clase', this.clase.idClase]);
    }
  }

  deleteClase(): void {
    if (!this.clase) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la clase "${this.clase.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.clase) {
        this._claseService.deleteClase(this.clase.idClase).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Clase eliminada correctamente', () => {
              this._router.navigate(['/view-clase']);
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar clase:', error);
            this.showAlert('error', 'Error al eliminar la clase');
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-clase']);
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