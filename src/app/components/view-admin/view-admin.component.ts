import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-admin',
  templateUrl: './view-admin.component.html',
  styleUrls: ['./view-admin.component.css']
})
export class ViewAdminComponent implements OnInit {
  admins: Admin[] = [];
  filter: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: res => {
        if (res.status === 200) {
          this.admins = res.data;
        } else {
          console.error('Error cargando administradores', res);
        }
      },
      error: err => console.error('Error cargando administradores', err)
    });
  }

  deleteAdmin(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar administrador con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteAdmin(id).subscribe({
          next: res => {
            Swal.fire('Eliminado', 'Administrador eliminado correctamente.', 'success');
            this.loadAdmins();
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el administrador.', 'error');
            console.error('Error al eliminar administrador', err);
          }
        });
      }
    });
  }

  showAdmin(id: number): void {
    this.router.navigate(['/show-admin', id]);
  }

  get filteredAdmins(): Admin[] {
    if (!this.filter) return this.admins;
    const term = this.filter.toLowerCase();
    return this.admins.filter(a =>
      a.idAdmin.toString().includes(term) ||
      a.nombre.toLowerCase().includes(term) ||
      a.apellido.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term)
    );
  }
}
