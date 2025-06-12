import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-show-detallemantenimiento',
  templateUrl: './show-detallemantenimiento.component.html',
  styleUrls: ['./show-detallemantenimiento.component.css']
})
export class ShowDetallemantenimientoComponent implements OnInit {
  public detalle: DetalleMantenimiento | null = null;
  public admins: Admin[] = [];
  public equipos: Equipo[] = [];
  public mantenimientos: Mantenimiento[] = [];

  constructor(
    private detalleService: DetalleMantenimientoService,
    private adminService: AdminService,
    private equipoService: EquipoService,
    private mantenimientoService: MantenimientoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllData();
    const id = this.route.snapshot.params['id'];
    if (id) this.loadDetalle(id);
  }

  loadAllData(): void {
    this.adminService.getAdmins().subscribe({
      next: (resAdmins) => {
        this.admins = Array.isArray(resAdmins) ? resAdmins : [];

        this.equipoService.getEquipos().subscribe({
          next: (resEquipos) => {
            this.equipos = Array.isArray(resEquipos.data) ? resEquipos.data : [];

            this.mantenimientoService.getMantenimientos().subscribe({
              next: (resMantenimientos) => {
                this.mantenimientos = Array.isArray(resMantenimientos.data) ? resMantenimientos.data : [];
              },
              error: (err) => console.error('Error cargando mantenimientos', err)
            });
          },
          error: (err) => console.error('Error cargando equipos', err)
        });
      },
      error: (err) => console.error('Error cargando admins', err)
    });
  }


  loadDetalle(id: number): void {
    this.detalleService.showDetalle(id).subscribe({
      next: (res) => {
        if (res?.detalle) {
          this.detalle = res.detalle;
        } else {
          this.showAlert('error', 'Detalle no encontrado');
          this.router.navigate(['/view-detallemantenimiento']);
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error al cargar el detalle');
        this.router.navigate(['/view-detallemantenimiento']);
      }
    });
  }

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

  showAlert(type: 'error' | 'success', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    });
  }

  back(): void {
    this.router.navigate(['/view-detallemantenimiento']);
  }
}