import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-mantenimiento',
  templateUrl: './show-mantenimiento.component.html',
  styleUrls: ['./show-mantenimiento.component.css']
})
export class ShowMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento | null = null;
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
      next: response => {
        if (response?.mantenimiento) {
          const m = response.mantenimiento;
          this.mantenimiento = new Mantenimiento(
            m.idMantenimiento,
            m.descripcion,
            m.costo,
            m.idAdmin
          );
        } else {
          this.showAlert('error', 'Mantenimiento no encontrado');
          this.router.navigate(['/view-mantenimiento']);
        }
      },
      error: error => {
        console.error('Error al obtener mantenimiento:', error);
        this.showAlert('error', 'Error al obtener los datos del mantenimiento');
        this.router.navigate(['/view-mantenimiento']);
      }
    });
  }

  getUserName(idAdmin: number): string {
    const admin = this.admins.find(a => a.idAdmin === idAdmin);
    return admin ? `${admin.nombre} ${admin.apellido}` : 'Desconocido';
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
    this.router.navigate(['/view-mantenimiento']);
  }
}