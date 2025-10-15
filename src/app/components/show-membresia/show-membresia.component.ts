import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-membresia',
  templateUrl: './show-membresia.component.html',
  styleUrls: ['./show-membresia.component.css']
})
export class ShowMembresiaComponent implements OnInit {
  public membresia: Membresia | null = null;
  public isLoading: boolean = false;

  constructor(
    private _membresiaService: MembresiaService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMembresia(Number(id));
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
        console.error('Error al obtener membresía:', error);
        this.showAlert('error', 'Error al obtener los datos de la membresía');
        this._router.navigate(['/view-membresia']);
        this.isLoading = false;
      }
    });
  }

  editMembresia(): void {
    if (this.membresia) {
      this._router.navigate(['/update-membresia', this.membresia.idMembresia]);
    }
  }

  deleteMembresia(): void {
    if (!this.membresia) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la membresía "${this.membresia.tipo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.membresia) {
        this._membresiaService.deleteMembresia(this.membresia.idMembresia).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Membresía eliminada correctamente', () => {
              this._router.navigate(['/view-membresia']);
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar membresía:', error);
            this.showAlert('error', 'Error al eliminar la membresía');
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-membresia']);
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