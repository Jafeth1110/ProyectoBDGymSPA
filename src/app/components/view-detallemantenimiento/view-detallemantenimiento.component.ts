import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';

@Component({
  selector: 'app-view-detalle-mantenimiento',
  templateUrl: './view-detallemantenimiento.component.html',
  styleUrls: ['./view-detallemantenimiento.component.css']
})
export class ViewDetallemantenimientoComponent implements OnInit {
  detalles: DetalleMantenimiento[] = [];
  filter: string = '';

  constructor(
    private detalleService: DetalleMantenimientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDetalles();
  }

  loadDetalles(): void {
    this.detalleService.getDetalles().subscribe({
      next: res => {
        if (res.status === 200) {
          this.detalles = res.data;
        } else {
          console.error('Error cargando detalles de mantenimiento', res);
        }
      },
      error: err => console.error('Error cargando detalles de mantenimiento', err)
    });
  }

  deleteDetalle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar detalle con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.detalleService.deleteDetalle(id).subscribe({
          next: res => {
            if (res.status === 200) {
              Swal.fire('Eliminado', 'Detalle eliminado correctamente.', 'success');
              this.loadDetalles();
            } else {
              Swal.fire('Error', res.message || 'No se pudo eliminar el detalle.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el detalle.', 'error');
            console.error('Error al eliminar detalle', err);
          }
        });
      }
    });
  }

  navigateToAddDetalle(): void {
    this.router.navigate(['/add-detallemantenimiento']);
  }

  showDetalle(id: number): void {
    this.router.navigate(['/show-detallemantenimiento', id]);
  }

  updateDetalle(id: number): void {
    this.router.navigate(['/update-detallemantenimiento', id]);
  }

  get filteredDetalles(): DetalleMantenimiento[] {
    if (!this.filter) return this.detalles;
    const term = this.filter.toLowerCase();
    return this.detalles.filter(d =>
      d.idDetalleMantenimiento.toString().includes(term) ||
      d.idAdmin.toString().includes(term) ||
      d.idEquipo.toString().includes(term) ||
      d.idMantenimiento.toString().includes(term) ||
      d.fechaMantenimiento.toLowerCase().includes(term)
    );
  }
}
