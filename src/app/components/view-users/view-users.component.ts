import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filter: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Siempre recargar los datos cuando se inicializa el componente
    this.users = []; // Limpiar la lista primero
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: res => {
        console.log('Respuesta completa:', res); // Para debugging
        if (res.status === 200) {
          // Usar 'users' en lugar de 'data' según la respuesta del servidor
          const usersData = res.users || res.data || [];
          // Procesar los usuarios para corregir el rol
          this.users = usersData.map((u: any) => {
            // Manejar el rol correctamente
            let rolString = '';
            if (typeof u.rol === 'string') {
              rolString = u.rol;
            } else if (u.rol && u.rol.nombreRol) {
              rolString = u.rol.nombreRol;
            } else if (u.idRol) {
              // Fallback basado en idRol
              switch (u.idRol) {
                case 1: rolString = 'admin'; break;
                case 2: rolString = 'cliente'; break;
                case 3: rolString = 'entrenador'; break;
                default: rolString = 'cliente';
              }
            }
            
            return new User(
              u.idUsuario,
              u.nombre,
              u.apellido,
              u.cedula,
              u.email,
              u.password,
              rolString, // Usar el rol procesado
              u.idRol,
              u.telefonos || []
            );
          });
        } else {
          console.error('Error cargando usuarios', res);
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
      },
      error: err => {
        console.error('Error cargando usuarios', err);
        Swal.fire('Error', 'Error al conectar con el servidor', 'error');
      }
    });
  }

  deleteUser(email: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar usuario con email ${email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(email).subscribe({
          next: res => {
            if (res.status === 200) {
              Swal.fire('Eliminado', 'Usuario eliminado correctamente.', 'success');
              this.loadUsers();
            } else {
              Swal.fire('Error', res.message || 'No se pudo eliminar el usuario.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            console.error('Error al eliminar usuario', err);
          }
        });
      }
    });
  }

  navigateToAddUser(): void {
    this.router.navigate(['/add-user']);
  }

  showUser(email: string): void {
    this.router.navigate(['/show-user', email]);
  }

  updateUser(email: string): void {
    this.router.navigate(['/update-user', email]);
  }

  get filteredUsers(): User[] {
    if (!this.filter) return this.users;
    const term = this.filter.toLowerCase();
    return this.users.filter(u =>
      u.idUsuario.toString().includes(term) ||
      u.nombre.toLowerCase().includes(term) ||
      u.apellido.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }
}
