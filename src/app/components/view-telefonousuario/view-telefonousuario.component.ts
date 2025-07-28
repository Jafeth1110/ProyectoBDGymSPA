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
        console.log('Respuesta completa de teléfonos:', response);
        
        // El backend ya devuelve la información completa
        const telefonosData = Array.isArray(response.data) ? response.data : [];
        console.log('Teléfonos recibidos:', telefonosData);
        
        // Mapear la respuesta del backend al formato que espera el frontend
        this.telefonos = telefonosData.map((telefono: any) => ({
          idTelefono: telefono.idTelefono,
          idUsuario: telefono.usuario.idUsuario,
          telefono: telefono.telefono,
          tipoTel: telefono.tipoTel,
          idRol: telefono.rol.idRol,
          user: {
            idUsuario: telefono.usuario.idUsuario,
            nombre: telefono.usuario.nombre,
            apellido: telefono.usuario.apellido,
            email: telefono.usuario.email,
            cedula: telefono.usuario.cedula,
            rol: telefono.rol.nombreRol
          },
          rol: {
            idRol: telefono.rol.idRol,
            nombreRol: telefono.rol.nombreRol,
            descripcion: ''
          }
        }));
        
        console.log('Teléfonos procesados:', this.telefonos);
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
      (telefono.user?.nombre?.toLowerCase().includes(filterLower)) ||
      (telefono.user?.apellido?.toLowerCase().includes(filterLower)) ||
      (telefono.user?.email?.toLowerCase().includes(filterLower)) ||
      (telefono.rol?.nombreRol?.toLowerCase().includes(filterLower))
    );
  }

  showTelefono(id: number): void {
    // Necesitamos obtener el teléfono para pasar el tipo
    const telefono = this.telefonos.find(t => t.idTelefono === id);
    console.log('Mostrando teléfono:', id, telefono);
    if (telefono) {
      this.router.navigate(['/show-telefonousuario', id, telefono.tipoTel]);
    }
  }

  editTelefono(id: number): void {
    // Necesitamos obtener el teléfono para pasar el tipo
    const telefono = this.telefonos.find(t => t.idTelefono === id);
    console.log('Editando teléfono:', id, telefono);
    if (telefono) {
      this.router.navigate(['/update-telefonousuario', id, telefono.tipoTel]);
    }
  }

  deleteTelefono(id: number): void {
    console.log('Eliminando teléfono:', id);
    
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
            console.log('Teléfono eliminado exitosamente');
            Swal.fire('Eliminado', 'Teléfono eliminado correctamente.', 'success');
            this.loadTelefonos(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting phone:', error);
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
    if (telefono.user?.nombre && telefono.user?.apellido) {
      return `${telefono.user.nombre} ${telefono.user.apellido}`;
    }
    return 'Usuario no disponible';
  }

  getUserEmail(telefono: any): string {
    return telefono.user?.email || 'Email no disponible';
  }

  /**
   * Obtiene el nombre del rol del teléfono
   */
  getRolName(telefono: any): string {
    // Prioridad 1: rol desde la respuesta anidada
    if (telefono.rol?.nombreRol) {
      return telefono.rol.nombreRol;
    }
    
    // Prioridad 2: rol desde el usuario anidado
    if (telefono.user?.rol) {
      return telefono.user.rol;
    }
    
    // Prioridad 3: calcular rol usando idRol del teléfono
    if (telefono.idRol) {
      switch (telefono.idRol) {
        case 1: return 'admin';
        case 2: return 'cliente';
        case 3: return 'entrenador';
        default: return 'N/A';
      }
    }
    
    // Prioridad 4: calcular rol usando idRol del usuario anidado
    if (telefono.user?.idRol) {
      switch (telefono.user.idRol) {
        case 1: return 'admin';
        case 2: return 'cliente';
        case 3: return 'entrenador';
        default: return 'N/A';
      }
    }
    
    return 'N/A';
  }

  /**
   * Obtiene la clase CSS para el badge del rol
   */
  getRolBadgeClass(telefono: any): string {
    const rolName = this.getRolName(telefono).toLowerCase();
    return rolName !== 'n/a' ? rolName : '';
  }

  /**
   * Obtiene el ID de usuario o N/A si no está disponible
   */
  getUserId(telefono: any): string {
    return telefono.idUsuario ? telefono.idUsuario.toString() : 'N/A';
  }
}
