import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-mantenimiento',
  templateUrl: './update-mantenimiento.component.html',
  styleUrls: ['./update-mantenimiento.component.css']
})
export class UpdateMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento = new Mantenimiento();
  public validationErrors: string[] = [];
  public admins: Admin[] = [];

  constructor(
    private mantenimientoService: MantenimientoService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMantenimiento(id);
      }
    });
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: resAdmins => {
        console.log('Respuesta de admins:', resAdmins); // Para debugging
        if (resAdmins.status === 200) {
          this.admins = resAdmins.data;
        } else {
          // Si la respuesta es directamente un array
          this.admins = Array.isArray(resAdmins) ? resAdmins : [];
        }
      },
      error: err => {
        console.error('Error cargando admins', err);
        Swal.fire('Error', 'No se pudieron cargar los administradores', 'error');
      }
    });
  }

  loadMantenimiento(id: number): void {
    this.mantenimientoService.showMantenimiento(id).subscribe({
      next: res => {
        if (res.status === 200 && res.mantenimiento) {
          this.mantenimiento = res.mantenimiento;
        } else {
          this.showAlert('error', 'Mantenimiento no encontrado');
          this.router.navigate(['/view-mantenimiento']);
        }
      },
      error: err => {
        this.showAlert('error', 'Error al cargar el mantenimiento');
        this.router.navigate(['/view-mantenimiento']);
      }
    });
  }

  updateMantenimiento(): void {
    this.validationErrors = [];
    
    if (!this.mantenimiento.descripcion || this.mantenimiento.costo == null || !this.mantenimiento.idAdmin) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    const dataToSend = {
      descripcion: this.mantenimiento.descripcion,
      costo: this.mantenimiento.costo,
      idAdmin: this.mantenimiento.idAdmin,
    };

    this.mantenimientoService.updateMantenimiento(this.mantenimiento.idMantenimiento, dataToSend).subscribe({
      next: res => {
        if (res.status === 200) {
          this.showAlert('success', 'Mantenimiento actualizado correctamente');
          this.router.navigate(['/view-mantenimiento']);
        } else {
          this.showAlert('error', res.message || 'No se pudo actualizar el mantenimiento');
        }
      },
      error: err => {
        if (err.status === 422 && err.error?.errors) {
          const errors: string[] = [];
          Object.keys(err.error.errors).forEach(field => {
            const fieldErrors: string[] = err.error.errors[field];
            fieldErrors.forEach(msg => errors.push(msg));
          });
          this.validationErrors = errors;
          this.showAlert('error', errors.join('<br>'));
        } else {
          this.showAlert('error', 'Error al actualizar el mantenimiento');
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
    this.router.navigate(['/view-mantenimiento']);
  }
}