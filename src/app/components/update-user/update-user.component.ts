import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  public user: User = new User('', '', '', '', '', '', 'cliente');
  public originalEmail: string = ''; // Almacenaremos el email original aquí

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const encodedEmail = params['email'];

      if (!encodedEmail) {
        this.showErrorAndRedirect('Email no proporcionado');
        return;
      }

      try {
        this.originalEmail = decodeURIComponent(encodedEmail);
        this.loadUser(this.originalEmail);
      } catch (e) {
        console.error('Error al decodificar email:', e);
        this.showErrorAndRedirect('Email no válido');
      }
    });
  }


  loadUser(email: string): void {
  console.log('Cargando usuario con email:', email);
  this.userService.show(email).pipe(take(1)).subscribe({
    next: response => {
      console.log('Respuesta:', response); // Asegurate de ver qué viene

      const u = response?.user || response?.Usuario; // Dependiendo de tu API

      if (u) {
        this.user = new User(
          u.idUsuario,
          u.nombre,
          u.apellido,
          u.cedula,
          u.email,
          u.password,
          u.rol
        );
      } else {
        this.showErrorAndRedirect('Usuario no encontrado');
      }
    },
    error: error => {
      console.error('Error al obtener usuario:', error);
      this.showErrorAndRedirect('Error al cargar usuario');
    }
  });
}


  updateUser(): void {
    // Usamos el email original para la actualización
    this.userService.updateUser(this.originalEmail, this.user)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.showAlert('success', 'Usuario actualizado correctamente');
          this.router.navigate(['/view-users']);
        },
        error: err => {
          console.error('Error al actualizar usuario:', err);
          this.showAlert('error', 'Error al actualizar el usuario');
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/view-users']);
  }

  private showErrorAndRedirect(message: string): void {
    this.showAlert('error', message);
    this.router.navigate(['/view-users']);
  }

  private showAlert(type: 'error' | 'success', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    });
  }
}