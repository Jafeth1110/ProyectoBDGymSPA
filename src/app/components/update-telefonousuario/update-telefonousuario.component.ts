import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TelefonoUsuarioService } from '../../services/telefonoUsuario.service';
import { TelefonoUsuario } from '../../models/telefonoUsuario';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-telefonousuario',
  templateUrl: './update-telefonousuario.component.html',
  styleUrls: ['./update-telefonousuario.component.css'],
  providers: [TelefonoUsuarioService]
})
export class UpdateTelefonousuarioComponent implements OnInit {
  public telefono: TelefonoUsuario = new TelefonoUsuario();
  public validationErrors: string[] = [];
  public users: User[] = [];

  constructor(
    private _telefonoUsuarioService: TelefonoUsuarioService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadTelefono(id);
      }
    });

    this.loadUsuarios(); // ← Cargar todos los usuarios
  }

  loadTelefono(id: number): void {
    this._telefonoUsuarioService.showTelefono(id).subscribe(
      response => {
        if (response?.telefono) {
          const t = response.telefono;
          this.telefono = new TelefonoUsuario(
            t.idTelefonoUsuario,
            t.idUsuario,
            t.tipoTel,
            t.telefono
          );
        } else {
          this.showAlert('error', 'Teléfono no encontrado');
          this._router.navigate(['/view-telefonousuario']);
        }
      },
      error => {
        this.showAlert('error', 'Error al obtener los datos del teléfono');
        this._router.navigate(['/view-telefonousuario']);
      }
    );
  }

  loadUsuarios(): void {
    this._userService.getUsers().subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.users = res.data;
        } else {
          console.error('Error al cargar usuarios');
        }
      },
      error: err => console.error('Error al cargar usuarios', err)
    });
  }

  updateTelefono(form?: any): void {
    this.validationErrors = [];
    if (
      !this.telefono.idUsuario ||
      !this.telefono.tipoTel ||
      !this.telefono.telefono
    ) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    const dataToSend = {
      idUsuario: this.telefono.idUsuario,
      tipoTel: this.telefono.tipoTel,
      telefono: this.telefono.telefono
    };

    this._telefonoUsuarioService.updateTelefono(this.telefono.idTelefonoUsuario, dataToSend).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.showAlert('success', 'Teléfono actualizado correctamente');
          this._router.navigate(['/view-telefonousuario']);
        } else {
          this.showAlert('error', response.message || 'No se pudo actualizar el teléfono');
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
    this._router.navigate(['/view-telefonousuario']);
  }
}
