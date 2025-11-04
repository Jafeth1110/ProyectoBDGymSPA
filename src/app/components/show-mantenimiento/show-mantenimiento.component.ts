import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-mantenimiento',
  templateUrl: './show-mantenimiento.component.html',
  styleUrls: ['./show-mantenimiento.component.css']
})
export class ShowMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMantenimiento(id);
      }
    });
  }

  loadMantenimiento(id: number): void {
    this.mantenimientoService.showMantenimiento(id).subscribe({
      next: response => {
        const m = response.mantenimiento || response.data || response;
        if (m) {
          this.mantenimiento = {
            idMantenimiento: m.idMantenimiento,
            descripcion: m.descripcion,
            costo: m.costo,
            idAdmin: m.idAdmin,
            admin_idUsuario: m.admin_idUsuario,
            admin_nombre: m.admin_nombre,
            admin_apellido: m.admin_apellido,
            admin_email: m.admin_email
          };
        } else {
          this.showAlert('error', 'Mantenimiento no encontrado');
          this.router.navigate(['/view-mantenimiento']);
        }
      },
      error: error => {
        this.showAlert('error', 'Error al obtener los datos del mantenimiento');
        this.router.navigate(['/view-mantenimiento']);
      }
    });
  }

  deleteMantenimiento(): void {
    if (!this.mantenimiento) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el mantenimiento #${this.mantenimiento.idMantenimiento}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.mantenimiento) {
        this.mantenimientoService.deleteMantenimiento(this.mantenimiento.idMantenimiento).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El mantenimiento ha sido eliminado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.router.navigate(['/view-mantenimiento']);
          },
          error: (error) => {
            console.error('Error al eliminar mantenimiento:', error);
            this.showAlert('error', 'Error al eliminar el mantenimiento');
          }
        });
      }
    });
  }

  showAlert(type: 'error' | 'success', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    });
  }

  back(): void {
    this.router.navigate(['/view-mantenimiento']);
  }
}