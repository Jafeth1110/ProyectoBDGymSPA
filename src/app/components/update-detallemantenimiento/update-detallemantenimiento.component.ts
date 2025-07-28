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

@Component({
  selector: 'app-update-detallemantenimiento',
  templateUrl: './update-detallemantenimiento.component.html',
  styleUrls: ['./update-detallemantenimiento.component.css']
})
export class UpdateDetallemantenimientoComponent implements OnInit {
  public detalle: DetalleMantenimiento = new DetalleMantenimiento();
  public validationErrors: string[] = [];
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
        console.log('Respuesta de admins:', resAdmins); // Para debugging
        if (resAdmins.status === 200) {
          this.admins = resAdmins.data;
        } else {
          // Si la respuesta es directamente un array
          this.admins = Array.isArray(resAdmins) ? resAdmins : [];
        }

        this.equipoService.getEquipos().subscribe({
          next: (resEquipos) => {
            console.log('Equipos cargados:', resEquipos);
            if (resEquipos.status === 200) {
              this.equipos = resEquipos.data;
            } else {
              this.equipos = Array.isArray(resEquipos) ? resEquipos : [];
            }

            this.mantenimientoService.getMantenimientos().subscribe({
              next: (resMantenimientos) => {
                console.log('Mantenimientos cargados:', resMantenimientos);
                if (resMantenimientos.status === 200) {
                  this.mantenimientos = resMantenimientos.data;
                } else {
                  this.mantenimientos = Array.isArray(resMantenimientos) ? resMantenimientos : [];
                }
              },
              error: (err) => {
                console.error('Error cargando mantenimientos', err);
                Swal.fire('Error', 'No se pudieron cargar los mantenimientos', 'error');
              }
            });
          },
          error: (err) => {
            console.error('Error cargando equipos', err);
            Swal.fire('Error', 'No se pudieron cargar los equipos', 'error');
          }
        });
      },
      error: (err) => {
        console.error('Error cargando admins', err);
        Swal.fire('Error', 'No se pudieron cargar los administradores', 'error');
      }
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

  updateDetalle(): void {
    this.validationErrors = [];

    // Validación de campos requeridos
    const { idAdmin, idEquipo, idMantenimiento, fechaMantenimiento, idDetalleMantenimiento } = this.detalle;
    if (!idAdmin || !idEquipo || !idMantenimiento || !fechaMantenimiento) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    const dataToSend = { idAdmin, idEquipo, idMantenimiento, fechaMantenimiento };

    this.detalleService.updateDetalle(idDetalleMantenimiento, dataToSend).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.showAlert('success', 'Detalle actualizado correctamente');
          this.router.navigate(['/view-detallemantenimiento']);
        } else {
          this.showAlert('error', res.message || 'No se pudo actualizar el detalle');
        }
      },
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors = Object.values(err.error.errors as Record<string, string[]>).flat();
          this.showAlert('error', this.validationErrors.join('<br>'));
        } else {
          this.showAlert('error', 'Error al actualizar el detalle');
        }
      }

    });
  }


  showAlert(type: 'success' | 'error', message: string) {
    Swal.fire({
      title: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false
    });
  }

  cancel(): void {
    this.router.navigate(['/view-detallemantenimiento']);
  }
}