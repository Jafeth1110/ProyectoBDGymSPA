import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-mantenimiento',
  templateUrl: './add-mantenimiento.component.html',
  styleUrls: ['./add-mantenimiento.component.css']
})
export class AddMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento = new Mantenimiento();
  public validationErrors: string[] = [];
  public admins: Admin[] = [];

  constructor(
    private mantenimientoService: MantenimientoService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
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

  onSubmit(form?: any): void {
    this.validationErrors = [];
    
    if (!this.mantenimiento.descripcion || this.mantenimiento.costo == null || !this.mantenimiento.idAdmin) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this.mantenimientoService.storeMantenimiento(this.mantenimiento).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Mantenimiento registrado correctamente');
          this.router.navigate(['/view-mantenimiento']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el mantenimiento');
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
    this.router.navigate(['/view-mantenimiento']);
  }
}