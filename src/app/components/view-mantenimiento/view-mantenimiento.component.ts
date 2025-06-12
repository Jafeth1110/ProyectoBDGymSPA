import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';

@Component({
  selector: 'app-view-mantenimiento',
  templateUrl: './view-mantenimiento.component.html',
  styleUrls: ['./view-mantenimiento.component.css']
})
export class ViewMantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  admins: Admin[] = [];
  filter: string = '';

  constructor(
    private mantenimientoService: MantenimientoService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAdminsAndMantenimientos();
  }

  loadAdminsAndMantenimientos(): void {
    this.adminService.getAdmins().subscribe({
      next: resAdmins => {
        this.admins = resAdmins;

        this.mantenimientoService.getMantenimientos().subscribe({
          next: resMantenimiento => {
            if (resMantenimiento.status === 200) {
              this.mantenimientos = resMantenimiento.data;
            } else {
              console.error('Error cargando mantenimientos', resMantenimiento);
            }
          },
          error: err => console.error('Error cargando mantenimientos', err)
        });
      },
      error: err => console.error('Error cargando admins', err)
    });
  }

  getUserName(idAdmin: number): string {
    const admin = this.admins.find(a => a.idAdmin === idAdmin);
    return admin ? `${admin.nombre} ${admin.apellido}` : 'Desconocido';
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
              this.loadAdminsAndMantenimientos();
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
