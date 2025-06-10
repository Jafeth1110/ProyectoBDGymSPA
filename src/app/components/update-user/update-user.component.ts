import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
  providers: [UserService]
})
export class UpdateUserComponent implements OnInit {
  public user: User;
  public validationErrors: string[] = [];

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    // Inicializa el usuario vacío
    this.user = new User(0, '', '', '', '', '', 'cliente');
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.loadUser(email);
      }
    });
  }

  loadUser(email: string): void {
    this._userService.showUser(email).subscribe(
      response => {
        if (response?.user) {
          const u = response.user;
          this.user = new User(
            u.idUsuario,
            u.nombre,
            u.apellido,
            u.cedula,
            u.email,
            '', // No traigas la contraseña
            u.rol
          );
        } else {
          this.showAlert('error', 'Usuario no encontrado');
          this._router.navigate(['/usuarios']);
        }
      },
      error => {
        this.showAlert('error', 'Error al obtener los datos del usuario');
        this._router.navigate(['/usuarios']);
      }
    );
  }

  updateUser(form?: any): void {
    this.validationErrors = [];
    if (
      !this.user.nombre ||
      !this.user.apellido ||
      !this.user.cedula ||
      !this.user.email ||
      !this.user.rol
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // Prepara los datos para enviar (sin la contraseña si está vacía)
    const dataToSend: any = {
      idUsuario: this.user.idUsuario,
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      cedula: this.user.cedula,
      email: this.user.email,
      rol: this.user.rol
    };
    if (this.user.password && this.user.password.trim() !== '') {
      dataToSend.password = this.user.password;
    }

    this._userService.updateUser(this.user.email, { data: dataToSend }).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.showAlert('success', 'Usuario actualizado correctamente');
          this._router.navigate(['/usuarios']);
        } else {
          this.showAlert('error', response.message || 'No se pudo actualizar el usuario');
        }
      },
      error: (error: any) => {
        if (error.status === 400 && error.error && error.error.message) {
          this.showAlert('error', error.error.message);
        } else if (error.status === 422 && error.error && error.error.errors) {
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

  cancel(): void {
    this._router.navigate(['/view-users']);
  }
}