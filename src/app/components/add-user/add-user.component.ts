import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [UserService]
})
export class AddUserComponent {
  public user: User;
  public validationErrors: string[] = [];

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {
    this.user = new User(0, '', '', '', '', '', 'cliente');
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];
    if (
      !this.user.nombre ||
      !this.user.apellido ||
      !this.user.cedula ||
      !this.user.email ||
      !this.user.password ||
      !this.user.rol
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // ENVÍA LOS DATOS DIRECTAMENTE
    this._userService.storeUser(this.user).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Usuario registrado correctamente');
          this._router.navigate(['/view-users']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el usuario');
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

  back(): void {
    this._router.navigate(['/view-users']);
  }
}
