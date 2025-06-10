import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TelefonoUsuarioService } from '../../services/telefonoUsuario.service';
import { TelefonoUsuario } from '../../models/telefonoUsuario';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-telefonousuario',
  templateUrl: './add-telefonousuario.component.html',
  styleUrls: ['./add-telefonousuario.component.css'],
  providers: [TelefonoUsuarioService, UserService]
})
export class AddTelefonousuarioComponent implements OnInit {
  public telefono: TelefonoUsuario = new TelefonoUsuario();
  public validationErrors: string[] = [];
  public usuarios: User[] = [];

  constructor(
    private _telefonoUsuarioService: TelefonoUsuarioService,
    private _userService: UserService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._userService.getUsers().subscribe({
      next: res => {
        if (res.status === 200) {
          this.usuarios = res.data;
        }
      },
      error: err => {
        this.usuarios = [];
      }
    });
  }

  onSubmit(form?: any): void {
    this.validationErrors = [];
    if (
      !this.telefono.idUsuario ||
      !this.telefono.tipoTel ||
      !this.telefono.telefono
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this._telefonoUsuarioService.storeTelefono(this.telefono).subscribe({
      next: (response: any) => {
        if (response.status === 201 || response.status === 200) {
          if (form) form.reset();
          this.showAlert('success', 'Teléfono registrado correctamente');
          this._router.navigate(['/view-telefonousuario']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el teléfono');
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
    this._router.navigate(['/view-telefonousuario']);
  }
}
