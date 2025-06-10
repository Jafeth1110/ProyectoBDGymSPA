import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';

@Component({
  selector: 'app-view-mantenimiento',
  templateUrl: './view-mantenimiento.component.html',
  styleUrls: ['./view-mantenimiento.component.css']
})
export class ViewMantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  filter: string = '';

  constructor(
    private mantenimientoService: MantenimientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMantenimientos();
  }

  loadMantenimientos(): void {
    this.mantenimientoService.getMantenimientos().subscribe({
      next: res => {
        if (res.status === 200) {
          this.mantenimientos = res.data;
        } else {
          console.error('Error cargando mantenimientos', res);
        }
      },
      error: err => console.error('Error cargando mantenimientos', err)
    });
  }

  deleteMantenimiento(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar mantenimiento con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mantenimientoService.deleteMantenimiento(id).subscribe({
          next: res => {
            if (res.status === 200) {
              Swal.fire('Eliminado', 'Mantenimiento eliminado correctamente.', 'success');
              this.loadMantenimientos();
            } else {
              Swal.fire('Error', res.message || 'No se pudo eliminar el mantenimiento.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el mantenimiento.', 'error');
            console.error('Error al eliminar mantenimiento', err);
          }
        });
      }
    });
  }

  navigateToAddMantenimiento(): void {
    this.router.navigate(['/add-mantenimiento']);
  }

  showMantenimiento(id: number): void {
    this.router.navigate(['/show-mantenimiento', id]);
  }

  updateMantenimiento(id: number): void {
    this.router.navigate(['/update-mantenimiento', id]);
  }

  get filteredMantenimientos(): Mantenimiento[] {
    if (!this.filter) return this.mantenimientos;
    const term = this.filter.toLowerCase();
    return this.mantenimientos.filter(m =>
      m.idMantenimiento.toString().includes(term) ||
      m.descripcion.toLowerCase().includes(term) ||
      m.costo.toString().includes(term)
    );
  }
}
