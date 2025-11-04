import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.css'],
  providers: [UserService]
})
export class ShowUserComponent implements OnInit {
  public user: User | null = null;
  public error: string | null = null;
  public isLoading: boolean = false;

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.loadUser(email);
      }
    });
  }

  loadUser(email: string): void {
    this.error = null; // Limpiar errores previos
    this.isLoading = true;
    
    this._userService.showUser(email).subscribe(
      response => {
        console.log('Respuesta completa del servidor:', response);

        if (response?.user) {
          const u = response.user;
          console.log('Datos del usuario desde response.user:', u);
          
          // Mapear rol basado en idRol si el rol no viene mapeado
          let rolFinal = u.rol;
          if (!rolFinal && u.idRol) {
            switch (u.idRol) {
              case 1: rolFinal = 'admin'; break;
              case 2: rolFinal = 'cliente'; break;
              case 3: rolFinal = 'entrenador'; break;
              default: rolFinal = 'sin_rol';
            }
          }
          
          // Procesar teléfonos - verificar diferentes propiedades posibles
          const telefonos = u.telefonos || u.telefonos_list || [];
          console.log('Teléfonos procesados:', telefonos);
          
          this.user = new User(
            u.idUsuario,
            u.nombre,
            u.apellido,
            u.cedula,
            u.email,
            '', // password no se envía desde el backend por seguridad
            u.rol || rolFinal || 'sin_rol', // Usar rol final calculado
            u.idRol,
            telefonos // Usar telefonos del backend
          );
          
          console.log('Usuario cargado:', this.user);
          console.log('Teléfonos del usuario después de crear objeto:', this.user.telefonos);
          this.isLoading = false;
        } else {
          this.error = 'Usuario no encontrado';
          console.error('Usuario no encontrado en la respuesta:', response);
          this.user = null;
          this.isLoading = false;
        }
      },
      error => {
        console.error('Error al obtener usuario:', error);
        this.error = 'Error al obtener los datos del usuario. Verifica que el email sea correcto.';
        this.user = null;
        this.isLoading = false;
      }
    );
  }


  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 3000,
      showConfirmButton: true
    });
  }

  back(): void {
    this._router.navigate(['/view-users']);
  }

  editUser(): void {
    if (this.user) {
      this._router.navigate(['/update-user', this.user.email]);
    }
  }

  deleteUser(): void {
    if (this.user) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Quieres eliminar al usuario ${this.user.email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed && this.user) {
          this._userService.deleteUser(this.user.email).subscribe({
            next: (response) => {
              console.log('Usuario eliminado:', response);
              this.showAlert('success', 'Usuario eliminado exitosamente');
              this._router.navigate(['/view-users']);
            },
            error: (error) => {
              console.error('Error al eliminar usuario:', error);
              this.showAlert('error', 'Error al eliminar el usuario: ' + (error.error?.message || error.message));
            }
          });
        }
      });
    }
  }

  // Método para formatear el tipo de teléfono para mostrar
  formatTipoTelefono(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'casa': return 'Casa';
      case 'celular': return 'Celular';
      case 'trabajo': return 'Trabajo';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  }
}
