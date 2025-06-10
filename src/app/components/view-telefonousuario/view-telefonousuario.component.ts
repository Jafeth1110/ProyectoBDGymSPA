import { Component, OnInit } from '@angular/core';
import { TelefonoUsuarioService } from '../../services/telefonoUsuario.service';
import { TelefonoUsuario } from '../../models/telefonoUsuario';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-telefonousuario',
  templateUrl: './view-telefonousuario.component.html',
  styleUrls: ['./view-telefonousuario.component.css']
})
export class ViewTelefonousuarioComponent implements OnInit {
  telefonos: TelefonoUsuario[] = [];
  filter: string = '';

  constructor(
    private telefonoUsuarioService: TelefonoUsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTelefonos();
  }

  loadTelefonos(): void {
    this.telefonoUsuarioService.getTelefonos().subscribe({
      next: res => {
        if (res.status === 200) {
          this.telefonos = res.data;
        } else {
          console.error('Error cargando teléfonos', res);
        }
      },
      error: err => console.error('Error cargando teléfonos', err)
    });
  }

  deleteTelefono(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar teléfono con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.telefonoUsuarioService.deleteTelefono(id).subscribe({
          next: res => {
            if (res.status === 200) {
              Swal.fire('Eliminado', 'Teléfono eliminado correctamente.', 'success');
              this.loadTelefonos();
            } else {
              Swal.fire('Error', res.message || 'No se pudo eliminar el teléfono.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el teléfono.', 'error');
            console.error('Error al eliminar teléfono', err);
          }
        });
      }
    });
  }

  navigateToAddTelefono(): void {
    this.router.navigate(['/add-telefonousuario']);
  }

  showTelefono(id: number): void {
    this.router.navigate(['/show-telefonousuario', id]);
  }

  updateTelefono(id: number): void {
    this.router.navigate(['/update-telefonousuario', id]);
  }

  get filteredTelefonos(): TelefonoUsuario[] {
    if (!this.filter) return this.telefonos;
    const term = this.filter.toLowerCase();
    return this.telefonos.filter(t =>
      t.idTelefonoUsuario.toString().includes(term) ||
      t.idUsuario.toString().includes(term) ||
      t.tipoTel.toLowerCase().includes(term) ||
      t.telefono.toLowerCase().includes(term)
    );
  }
}
