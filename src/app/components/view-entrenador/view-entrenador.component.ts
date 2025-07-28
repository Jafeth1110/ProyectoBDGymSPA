import { Component, OnInit } from '@angular/core';
import { EntrenadorService } from '../../services/entrenador.service';
import { Entrenador } from '../../models/entrenador';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-entrenador',
  templateUrl: './view-entrenador.component.html',
  styleUrls: ['./view-entrenador.component.css']
})
export class ViewEntrenadorComponent implements OnInit {
  entrenadores: Entrenador[] = [];
  filter: string = '';

  constructor(
    private entrenadorService: EntrenadorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  loadEntrenadores(): void {
    this.entrenadorService.getEntrenadores().subscribe({
      next: res => {
        if (res.status === 200) {
          this.entrenadores = res.data;
        } else {
          console.error('Error cargando entrenadores', res);
        }
      },
      error: err => console.error('Error cargando entrenadores', err)
    });
  }

  deleteEntrenador(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar entrenador con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.entrenadorService.deleteEntrenador(id).subscribe({
          next: res => {
            Swal.fire('Eliminado', 'Entrenador eliminado correctamente.', 'success');
            this.loadEntrenadores();
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el entrenador.', 'error');
            console.error('Error al eliminar entrenador', err);
          }
        });
      }
    });
  }

  showEntrenador(id: number): void {
    this.router.navigate(['/show-entrenador', id]);
  }

  get filteredEntrenadores(): Entrenador[] {
    if (!this.filter) return this.entrenadores;
    const term = this.filter.toLowerCase();
    return this.entrenadores.filter(e =>
      e.idEntrenador.toString().includes(term) ||
      e.nombre.toLowerCase().includes(term) ||
      e.apellido.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      e.especialidad.toLowerCase().includes(term)
    );
  }
}
