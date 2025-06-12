import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';

@Component({
  selector: 'app-view-detalle-mantenimiento',
  templateUrl: './view-detallemantenimiento.component.html',
  styleUrls: ['./view-detallemantenimiento.component.css']
})
export class ViewDetallemantenimientoComponent implements OnInit {

  detalles: DetalleMantenimiento[] = [];
  admins: Admin[] = [];
  equipos: Equipo[] = []; // Asegúrate de inicializar como array
  mantenimientos: Mantenimiento[] = []; // Asegúrate de inicializar como array
  filter: string = '';

  constructor(
    private detalleService: DetalleMantenimientoService,
    private adminService: AdminService,
    private equipoService: EquipoService,
    private mantenimientoService: MantenimientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    // Cargamos todos los datos necesarios
    this.adminService.getAdmins().subscribe({
      next: (resAdmins: any) => {
        this.admins = Array.isArray(resAdmins) ? resAdmins : []; // Aseguramos que sea array
        
        this.equipoService.getEquipos().subscribe({
          next: (resEquipos: any) => {
            this.equipos = Array.isArray(resEquipos) ? resEquipos : resEquipos.data || []; // Manejo seguro
            
            this.mantenimientoService.getMantenimientos().subscribe({
              next: (resMantenimientos: any) => {
                this.mantenimientos = Array.isArray(resMantenimientos) ? resMantenimientos : 
                                     resMantenimientos.data || [];
                // Finalmente cargamos los detalles
                this.loadDetalles();
              },
              error: err => {
                console.error('Error cargando mantenimientos', err);
                this.mantenimientos = [];
              }
            });
          },
          error: err => {
            console.error('Error cargando equipos', err);
            this.equipos = [];
          }
        });
      },
      error: err => {
        console.error('Error cargando admins', err);
        this.admins = [];
      }
    });
  }

  // Métodos para obtener nombres con protección adicional
  getAdminName(idAdmin: number): string {
    if (!idAdmin || !Array.isArray(this.admins)) return 'Sin asignar';
    const admin = this.admins.find(a => a.idAdmin === idAdmin);
    return admin ? `${admin.nombre} ${admin.apellido}` : 'Desconocido';
  }

  getEquipoNombre(idEquipo: number): string {
    if (!idEquipo || !Array.isArray(this.equipos)) return 'Sin equipo';
    const equipo = this.equipos.find(e => e.idEquipo === idEquipo);
    return equipo ? equipo.nombre : 'Desconocido';
  }

  getMantenimientoDescripcion(idMantenimiento: number): string {
    if (!idMantenimiento || !Array.isArray(this.mantenimientos)) return 'Sin mantenimiento';
    const mantenimiento = this.mantenimientos.find(m => m.idMantenimiento === idMantenimiento);
    return mantenimiento ? mantenimiento.descripcion : 'Desconocido';
  }

  // Resto de tus métodos permanecen igual...
  loadDetalles(): void {
    this.detalleService.getDetalles().subscribe({
      next: res => {
        if (res.status === 200) {
          this.detalles = Array.isArray(res.data) ? res.data : [];
        } else {
          console.error('Error cargando detalles de mantenimiento', res);
          this.detalles = [];
        }
      },
      error: err => {
        console.error('Error cargando detalles de mantenimiento', err);
        this.detalles = [];
      }
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
      this.getAdminName(d.idAdmin).toLowerCase().includes(term) ||
      this.getEquipoNombre(d.idEquipo).toLowerCase().includes(term) ||
      this.getMantenimientoDescripcion(d.idMantenimiento).toLowerCase().includes(term) ||
      d.fechaMantenimiento.toLowerCase().includes(term)
    );
  }
}