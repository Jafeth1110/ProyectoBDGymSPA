import { Component } from '@angular/core';
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

  // Métodos para manejar teléfonos
  addTelefono(): void {
    this.user.addTelefono('celular', ''); // Establecer celular como tipo por defecto
  }

  removeTelefono(index: number): void {
    this.user.removeTelefono(index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];
    
    // Validar campos requeridos
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.showAlert('error', 'El formato del correo electrónico no es válido.');
      return;
    }

    // Validar teléfonos (si existen)
    const telefonosValidos = this.user.getValidTelefonos();
    for (let telefono of telefonosValidos) {
      if (!telefono.tipoTel) {
        this.showAlert('error', 'Todos los teléfonos deben tener un tipo seleccionado.');
        return;
      }
    }

    console.log('Usuario antes de enviar:', this.user);
    console.log('Teléfonos válidos:', telefonosValidos);

    this._userService.storeUser(this.user).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.user = new User(0, '', '', '', '', '', 'cliente');
          this.showAlert('success', 'Usuario registrado correctamente');
          this._router.navigate(['/view-users']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el usuario');
        }
      },
      error: (error: any) => {
        console.error('Error completo:', error);
        
        if (error.status === 406 && error.error) {
          this.showAlert('error', `Error: ${error.error.message || 'Datos no aceptables'}`);
        } else if (error.status === 400 && error.error && error.error.message) {
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
          this.showAlert('error', error.error?.message || 'Error inesperado del servidor.');
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
