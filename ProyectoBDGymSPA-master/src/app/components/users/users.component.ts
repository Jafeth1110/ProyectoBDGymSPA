import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filter: string = '';
  newUser: User = new User();

  validationErrors: string[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: res => {
        if (res.status === 200) {
          this.users = res.data;
        } else {
          console.error('Error cargando usuarios', res);
        }
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  deleteUser(idUsuario: number): void {
    if (!confirm(`¿Eliminar usuario con id ${idUsuario}?`)) return;

    this.userService.deleteUser(idUsuario).subscribe({
      next: res => {
        if (res.status === 200) this.loadUsers();
        else console.error('Error al eliminar', res);
      },
      error: err => console.error('Error al eliminar usuario', err)
    });
  }

  saveUser(): void {
    this.validationErrors = [];

    const u = this.newUser;
    if (!u.nombre || !u.apellido || !u.cedula || !u.email || !u.password || !u.rol) {
      alert('Debes completar todos los campos antes de enviar.');
      return;
    }

    this.userService.store(u).subscribe({
      next: res => {
        if (res.status === 201) {
          alert('Usuario creado correctamente.');
          this.loadUsers();
          this.newUser = new User();
        } else {
          console.error('Error inesperado creando usuario', res);
          alert(res.message || 'Error creando usuario');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('HTTP error', err);
        if (err.status === 422 && err.error && err.error.errors) {
          this.validationErrors = [];

          Object.keys(err.error.errors).forEach(field => {
            const fieldErrors: string[] = err.error.errors[field];
            fieldErrors.forEach(msg => this.validationErrors.push(msg));
          });
        } else {
          this.validationErrors = ['Error inesperado del servidor.'];
        }
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.filter) return this.users;
    const term = this.filter.toLowerCase();
    return this.users.filter(u =>
      u.idUsuario.toString().includes(term)||
      u.nombre.toLowerCase().includes(term) ||
      u.apellido.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }
}
