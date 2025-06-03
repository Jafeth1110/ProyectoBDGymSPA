import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [UserService]
})
export class AddUserComponent {
  public user: User = new User("", "", "", "", "", "", "cliente");
  public status: number = -1;

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {}

  onSubmit(): void {
    this._userService.create(this.user).subscribe(
      response => {
        if (response.status === 201 || response.status === 200) {
          this.showAlert('success', 'Usuario registrado correctamente');
        } else {
          this.showAlert('error', 'No se pudo registrar el usuario');
        }
      },
      error => {
        console.error('Error al registrar usuario:', error);
        this.showAlert('error', 'Error en la solicitud');
      }
    );
  }

  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    }).then(() => {
      if (type === 'success') {
        this._router.navigate(['/view-users']);
      }
    });
  }
}
