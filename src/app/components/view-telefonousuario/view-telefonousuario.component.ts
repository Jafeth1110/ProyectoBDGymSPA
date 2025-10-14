import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TelefonoService } from '../../services/telefono.service';
import { Telefono } from '../../models/telefono';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-telefonousuario',
  templateUrl: './view-telefonousuario.component.html',
  styleUrls: ['./view-telefonousuario.component.css']
})
export class ViewTelefonousuarioComponent implements OnInit {
  telefonos: Telefono[] = [];
  filteredTelefonos: Telefono[] = [];
  filter = '';
  loading = false;
  error = '';

  constructor(
    private telefonoService: TelefonoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTelefonos();
  }

  loadTelefonos(): void {
    this.loading = true;
    this.error = '';

    this.telefonoService.getAllTelefonos().subscribe({
      next: (response) => {
        const telefonosData = Array.isArray(response.data) ? response.data : [];

        this.telefonos = telefonosData.map((telefono: any) => ({
        idTelefono: Number(telefono.idTelefono),
        idUsuario: Number(telefono.idUsuario),
        telefono: telefono.telefono,
        tipoTel: telefono.tipoTel,
        idRol: telefono.rol?.idRol ?? 2,
        user: {
          idUsuario: telefono.user?.idUsuario ?? telefono.usuario?.idUsuario ?? 0,
          nombre: telefono.user?.nombre ?? telefono.usuario?.nombre ?? 'N/A',
          apellido: telefono.user?.apellido ?? telefono.usuario?.apellido ?? '',
          rol: telefono.rol?.nombreRol ?? 'cliente'
        },
        rol: {
          idRol: telefono.rol?.idRol ?? 2,
          nombreRol: telefono.rol?.nombreRol ?? 'cliente',
          descripcion: telefono.rol?.descripcion ?? ''
        }
      }));


        this.filteredTelefonos = [...this.telefonos];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading phones:', error);
        this.error = 'Error al cargar los teléfonos';
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar los teléfonos', 'error');
      }
    });
  }

  applyFilter(): void {
    if (!this.filter.trim()) {
      this.filteredTelefonos = [...this.telefonos];
      return;
    }

    const filterLower = this.filter.toLowerCase();
    this.filteredTelefonos = this.telefonos.filter(telefono => 
      telefono.telefono.toLowerCase().includes(filterLower) ||
      telefono.tipoTel.toLowerCase().includes(filterLower) ||
      telefono.idTelefono.toString().includes(filterLower) ||
      telefono.idUsuario.toString().includes(filterLower) ||
      (telefono.usuario?.nombre?.toLowerCase().includes(filterLower)) ||
      (telefono.usuario?.apellido?.toLowerCase().includes(filterLower)) ||
      (telefono.user?.nombre?.toLowerCase().includes(filterLower)) ||
      (telefono.user?.apellido?.toLowerCase().includes(filterLower)) ||
      (telefono.rol?.nombreRol?.toLowerCase().includes(filterLower))
    );
  }

  showTelefono(id: number): void {
    const telefono = this.telefonos.find(t => t.idTelefono === id);
    if (telefono) {
      this.router.navigate(['/show-telefonousuario', id, telefono.tipoTel]);
    }
  }

  editTelefono(id: number): void {
    const telefono = this.telefonos.find(t => t.idTelefono === id);
    if (telefono) {
      this.router.navigate(['/update-telefonousuario', id, telefono.tipoTel]);
    }
  }

  deleteTelefono(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.telefonoService.deleteTelefono(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Teléfono eliminado correctamente.', 'success');
            this.loadTelefonos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el teléfono.', 'error');
          }
        });
      }
    });
  }

  addTelefono(): void {
    this.router.navigate(['/add-telefonousuario']);
  }

  getUserName(telefono: any): string {
    // Intentar primero con 'usuario' que es lo que envía el backend
    if (telefono.usuario) {
      const nombre = telefono.usuario.nombre ?? '';
      const apellido = telefono.usuario.apellido ?? '';
      return `${nombre} ${apellido}`.trim() || 'Usuario no disponible';
    }
    // Fallback a 'user' para compatibilidad
    if (telefono.user) {
      const nombre = telefono.user.nombre ?? '';
      const apellido = telefono.user.apellido ?? '';
      return `${nombre} ${apellido}`.trim() || 'Usuario no disponible';
    }
    return 'Usuario no disponible';
  }


  getRolName(telefono: any): string {
    // Intentar primero con el objeto rol directo
    if (telefono.rol?.nombreRol) return telefono.rol.nombreRol;
    // Luego con usuario.rol
    if (telefono.usuario?.rol) return telefono.usuario.rol;
    // Fallback a user.rol para compatibilidad
    if (telefono.user?.rol) return telefono.user.rol;
    // Determinar por ID de rol si está disponible
    if (telefono.idRol) {
      switch (telefono.idRol) {
        case 1: return 'admin';
        case 2: return 'cliente';
        case 3: return 'entrenador';
      }
    }
    return 'entrenador'; // Default role
  }

  getRolBadgeClass(telefono: any): string {
    const rolName = this.getRolName(telefono).toLowerCase();
    return rolName !== 'n/a' ? rolName : '';
  }

  getUserId(telefono: any): string {
    return telefono.idUsuario ? telefono.idUsuario.toString() : 'N/A';
  }
}
