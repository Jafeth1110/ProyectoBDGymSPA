import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Equipo } from '../../models/equipo';
import { EquipoService } from '../../services/equipo.service';

@Component({
  selector: 'app-view-equipo',
  templateUrl: './view-equipo.component.html',
  styleUrls: ['./view-equipo.component.css']
})
export class ViewEquipoComponent implements OnInit {
  equipos: Equipo[] = [];
  filter: string = '';

  constructor(
    private equipoService: EquipoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos(): void {
    this.equipoService.getEquipos().subscribe({
      next: res => {
        if (res.status === 200) {
          this.equipos = res.data;
        } else {
          console.error('Error cargando equipos', res);
        }
      },
      error: err => console.error('Error cargando equipos', err)
    });
  }

  deleteEquipo(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar equipo con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.equipoService.deleteEquipo(id).subscribe({
          next: res => {
            if (res.status === 200) {
              Swal.fire('Eliminado', 'Equipo eliminado correctamente.', 'success');
              this.loadEquipos();
            } else {
              Swal.fire('Error', res.message || 'No se pudo eliminar el equipo.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el equipo.', 'error');
            console.error('Error al eliminar equipo', err);
          }
        });
      }
    });
  }

  navigateToAddEquipo(): void {
    this.router.navigate(['/add-equipo']);
  }

  showEquipo(id: number): void {
    this.router.navigate(['/show-equipo', id]);
  }

  updateEquipo(id: number): void {
    this.router.navigate(['/update-equipo', id]);
  }

  get filteredEquipos(): Equipo[] {
    if (!this.filter) return this.equipos;
    const term = this.filter.toLowerCase();
    return this.equipos.filter(e =>
      e.idEquipo?.toString().includes(term) ||
      e.nombre?.toLowerCase().includes(term) ||
      e.tipo?.toLowerCase().includes(term) ||
      (e.estado !== undefined && e.estado.toString().includes(term)) ||
      (e.cantidad !== undefined && e.cantidad.toString().includes(term))
    );
  }
}
