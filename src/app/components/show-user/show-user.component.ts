import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.css'],
  providers: [UserService]
})
export class ShowUserComponent implements OnInit {
  public user: User | null = null;

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.loadUser(email);
      }
    });
  }

  loadUser(email: string): void {
  this._userService.show(email).subscribe(
    response => {
      console.log('Respuesta del servidor:', response); // 👈 Te ayudará a ver el contenido

      if (response?.user) {
        const u = response.user;
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
        this.showAlert('error', 'Usuario no encontrado');
        this._router.navigate(['/view-users']);
      }
    },
    error => {
      console.error('Error al obtener usuario:', error);
      this.showAlert('error', 'Error al obtener los datos del usuario');
      this._router.navigate(['/view-users']);
    }
  );
}


  showAlert(type: 'error', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    });
  }

  back(): void {
    this._router.navigate(['/view-users']);
  }
}
