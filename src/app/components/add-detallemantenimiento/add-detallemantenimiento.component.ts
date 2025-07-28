import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  selector: 'app-add-detallemantenimiento',
  templateUrl: './add-detallemantenimiento.component.html',
  styleUrls: ['./add-detallemantenimiento.component.css']
})
export class AddDetallemantenimientoComponent implements OnInit {
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllData();
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
            console.log('Respuesta de equipos:', resEquipos); // Para debugging
            if (resEquipos.status === 200) {
              this.equipos = resEquipos.data;
            } else {
              this.equipos = Array.isArray(resEquipos) ? resEquipos : [];
            }

            this.mantenimientoService.getMantenimientos().subscribe({
              next: (resMantenimientos) => {
                console.log('Respuesta de mantenimientos:', resMantenimientos); // Para debugging
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



  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (
      !this.detalle.idAdmin ||
      !this.detalle.idEquipo ||
      !this.detalle.idMantenimiento ||
      !this.detalle.fechaMantenimiento
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this.detalleService.storeDetalle(this.detalle).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Detalle de mantenimiento registrado correctamente');
          this.router.navigate(['/view-detallemantenimiento']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el detalle');
        }
      },
      error: (error: any) => {
        if (error.status === 400 && error.error?.message) {
          this.showAlert('error', error.error.message);
        } else if (error.status === 422 && error.error?.errors) {
          const errors: string[] = [];
          Object.keys(error.error.errors).forEach(field => {
            const fieldErrors: string[] = error.error.errors[field];
            fieldErrors.forEach(msg => errors.push(msg));
          });
          this.validationErrors = errors;
          this.showAlert('error', errors.join('<br>'));
        } else {
          this.showAlert('error', 'Error inesperado del servidor.');
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

  back(): void {
    this.router.navigate(['/view-detallemantenimiento']);
  }
}