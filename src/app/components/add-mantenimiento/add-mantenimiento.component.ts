import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
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
  public isCurrentUserAdmin: boolean = false;
  public currentAdmin: Admin | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkCurrentUserRole();
    this.loadAdmins();
  }

  checkCurrentUserRole(): void {
    this.isCurrentUserAdmin = this.authService.isCurrentUserAdmin();
    console.log('¿Usuario actual es admin?', this.isCurrentUserAdmin);
    
    if (this.isCurrentUserAdmin) {
      const currentUser = this.authService.getCurrentUser();
      console.log('Usuario actual desde localStorage:', currentUser);
      
      // Obtener información del admin actual directamente del localStorage
      if (currentUser) {
        // Buscar el admin en la lista una vez que se cargue
        this.preselectCurrentAdminFromLocalStorage(currentUser);
      }
    }
  }

  preselectCurrentAdminFromLocalStorage(currentUser: any): void {
    console.log('Datos del usuario logueado:', currentUser);
    
    // Crear un objeto admin temporal con la información del localStorage
    this.currentAdmin = {
      idAdmin: currentUser.idAdmin || 0, // Puede que necesitemos buscarlo en la lista
      idUsuario: currentUser.idUsuario || currentUser.id,
      nombre: currentUser.nombre || currentUser.name || '',
      apellido: currentUser.apellido || currentUser.lastname || '',
      email: currentUser.email || '',
      cedula: currentUser.cedula || '',
      rol: currentUser.rol || currentUser.role || 'admin'
    };
    
    console.log('Admin actual procesado:', this.currentAdmin);
    
    // Si tenemos el idAdmin directamente, lo usamos
    if (this.currentAdmin.idAdmin > 0) {
      this.mantenimiento.idAdmin = this.currentAdmin.idAdmin;
    }
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
        
        // Después de cargar los admins, verificar si el usuario actual es admin
        this.preselectCurrentAdmin();
      },
      error: err => {
        console.error('Error cargando admins', err);
        Swal.fire('Error', 'No se pudieron cargar los administradores', 'error');
      }
    });
  }

  preselectCurrentAdmin(): void {
    if (this.isCurrentUserAdmin && this.admins.length > 0) {
      const currentUser = this.authService.getCurrentUser();
      console.log('Buscando admin actual en lista:', currentUser);
      
      // Mostrar detalles de cada admin para debug
      console.log('🔍 Detalles de cada admin:');
      this.admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`, {
          idAdmin: admin.idAdmin,
          idUsuario: admin.idUsuario,
          nombre: admin.nombre,
          apellido: admin.apellido,
          email: admin.email
        });
      });
      
      // Buscar el admin actual por múltiples criterios
      const foundAdmin = this.admins.find(admin => {
        const matchEmail = admin.email === currentUser?.email;
        const matchIdUsuario = admin.idUsuario === currentUser?.idUsuario;
        const matchSubId = admin.idUsuario === currentUser?.sub; // Usar 'sub' del JWT
        const matchId = admin.idUsuario === currentUser?.id;
        
        console.log(`🔍 Comparando con admin ${admin.nombre}:`, {
          adminEmail: admin.email,
          userEmail: currentUser?.email,
          matchEmail,
          adminIdUsuario: admin.idUsuario,
          userIdUsuario: currentUser?.idUsuario,
          userSub: currentUser?.sub,
          userIdField: currentUser?.id,
          matchIdUsuario,
          matchSubId,
          matchId
        });
        
        return matchEmail || matchIdUsuario || matchSubId || matchId;
      });
      
      if (foundAdmin) {
        this.currentAdmin = foundAdmin;
        this.mantenimiento.idAdmin = foundAdmin.idAdmin;
        console.log('✅ Admin encontrado en lista:', foundAdmin);
        console.log('✅ ID Admin establecido:', foundAdmin.idAdmin);
        
        // Mostrar mensaje informativo
        Swal.fire({
          title: 'Administrador Detectado',
          text: `Registrando mantenimiento como: ${foundAdmin.nombre} ${foundAdmin.apellido}`,
          icon: 'info',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        console.warn('❌ Admin no encontrado en lista por criterios exactos');
        
        // Intentar buscar por nombre parcial
        const alternativeAdmin = this.admins.find(admin => {
          const nameMatch = admin.nombre?.toLowerCase().includes(currentUser?.nombre?.toLowerCase()) ||
                           currentUser?.nombre?.toLowerCase().includes(admin.nombre?.toLowerCase());
          const emailPartialMatch = admin.email?.toLowerCase().includes(currentUser?.email?.split('@')[0]?.toLowerCase()) ||
                                   currentUser?.email?.toLowerCase().includes(admin.email?.split('@')[0]?.toLowerCase());
          
          console.log(`🔍 Búsqueda alternativa con ${admin.nombre}:`, {
            nameMatch,
            emailPartialMatch,
            adminNombre: admin.nombre,
            userNombre: currentUser?.nombre
          });
          
          return nameMatch || emailPartialMatch;
        });
        
        if (alternativeAdmin) {
          this.currentAdmin = alternativeAdmin;
          this.mantenimiento.idAdmin = alternativeAdmin.idAdmin;
          console.log('✅ Admin encontrado por búsqueda alternativa:', alternativeAdmin);
          
          Swal.fire({
            title: 'Administrador Detectado',
            text: `Registrando mantenimiento como: ${alternativeAdmin.nombre} ${alternativeAdmin.apellido}`,
            icon: 'info',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else {
          console.error('❌ No se pudo encontrar el admin en la lista');
          
          // Como solución temporal, usar el primer admin disponible
          // En un ambiente de producción, esto debería manejarse diferente
          if (this.admins.length > 0) {
            const fallbackAdmin = this.admins[0]; // Usar el primer admin como fallback
            this.currentAdmin = fallbackAdmin;
            this.mantenimiento.idAdmin = fallbackAdmin.idAdmin;
            
            console.log('⚠️ Usando admin por defecto:', fallbackAdmin);
            
            Swal.fire({
              title: 'Atención',
              text: `No se encontró su perfil de administrador. Se usará: ${fallbackAdmin.nombre} ${fallbackAdmin.apellido}`,
              icon: 'warning',
              confirmButtonText: 'Entendido',
              timer: 5000
            });
          } else {
            // Crear admin temporal para mostrar pero marcar como error
            this.currentAdmin = {
              idAdmin: 0,
              idUsuario: currentUser?.sub || currentUser?.idUsuario || currentUser?.id || 0,
              nombre: currentUser?.nombre || 'Admin',
              apellido: currentUser?.apellido || 'Usuario',
              email: currentUser?.email || '',
              cedula: '',
              rol: 'admin'
            };
            
            // Mostrar warning al usuario
            Swal.fire({
              title: 'Error de Configuración',
              text: 'No se pudo vincular con un administrador válido. Contacte al administrador del sistema para crear su perfil de admin.',
              icon: 'error',
              confirmButtonText: 'Entendido'
            });
          }
        }
      }
    }
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];
    
    // Validación mejorada
    if (!this.mantenimiento.descripcion || this.mantenimiento.costo == null || !this.mantenimiento.idAdmin) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // Validación adicional para asegurar que tenemos un admin válido
    if (this.mantenimiento.idAdmin === 0) {
      this.showAlert('error', 'No se pudo determinar el administrador. Por favor, recarga la página e intenta nuevamente.');
      return;
    }

    console.log('📤 Enviando mantenimiento:', this.mantenimiento);

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