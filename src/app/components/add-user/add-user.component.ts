import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  public user: User = new User(0, '', '', '', '', '', 'cliente');
  public validationErrors: string[] = [];

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {
    this.resetUser();
  }

  resetUser() {
    this.user = new User(0, '', '', '', '', '', 'cliente');
    this.user.telefonos = []; // Inicializar array de teléfonos
  }

  addTelefono(): void {
    this.user.telefonos.push({ tipoTel: 'celular', telefono: '' });
  }

  removeTelefono(index: number): void {
    this.user.telefonos.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];

    // Validaciones básicas
    if (!this.user.nombre || !this.user.apellido || !this.user.cedula ||
        !this.user.email || !this.user.password || !this.user.rol) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.showAlert('error', 'El formato del correo electrónico no es válido.');
      return;
    }

    // Validar teléfonos si existen
    for (let tel of this.user.telefonos) {
      if (!tel.tipoTel || !tel.telefono) {
        this.showAlert('error', 'Todos los teléfonos deben tener tipo y número.');
        return;
      }
      const telRegex = /^\d{8,12}$/;
      if (!telRegex.test(tel.telefono)) {
        this.showAlert('error', 'Cada teléfono debe tener entre 8 y 12 dígitos.');
        return;
      }
    }

    // Enviar usuario
    this._userService.storeUser(this.user).subscribe({
      next: (res: any) => {
        if (res.status === 200 || res.status === 201) {
          if (form) form.reset();
          this.resetUser();
          this.showAlert('success', 'Usuario registrado correctamente.');
          this._router.navigate(['/view-users']);
        } else {
          this.showAlert('error', res.message || 'No se pudo registrar el usuario.');
        }
      },
      error: (err: any) => {
        console.error('Error completo:', err);
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors = Object.values(err.error.errors).flat() as string[];
        }
        this.showAlert('error', err.error?.message || 'Error inesperado del servidor.');
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
