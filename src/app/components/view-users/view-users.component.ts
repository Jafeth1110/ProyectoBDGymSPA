import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css'],
  providers: [UserService]
})
export class ViewUsersComponent implements OnInit {
  public status: number = -1;
  public user: User = new User("", "", "", "", "", "", "");
  public identity: any = null;
  public users: User[] = [];
  public filteredUsers: User[] = [];
  public searchQuery: string = "";

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.loadIdentity();
  }

  loadIdentity(): void {
    const identity = sessionStorage.getItem('identity');
    if (identity) {
      try {
        this.identity = JSON.parse(identity);
      } catch (error) {
        console.error("Error al parsear la identidad desde sessionStorage:", error);
        this.identity = null;
      }
    }
  }

  getUsers(): void {
    this._userService.getUsers().subscribe(
      response => {
        if (response.status === 200 && Array.isArray(response.data)) {
          this.users = response.data.map((u: any) =>
            new User(
              u.idUsuario,
              u.nombre,
              u.apellido,
              u.cedula,
              u.email,
              u.password,
              u.rol
            )
          );
          this.filteredUsers = [...this.users];
        } else {
          this.status = response.status;
          this.filteredUsers = [];
        }
      },
      error => {
        console.error("Error al obtener usuarios:", error);
        this.status = error.status || 500;
      }
    );
  }

  navigateToAddUser(): void {
    this._router.navigate(['/add-user']);
  }

  navigateToShow(email: string): void {
    this._router.navigate(['/show-user', email]);
  }

  navigateToUpdate(email: string): void {
  if (!email) {
    Swal.fire({
      title: 'Error',
      text: 'No se proporcionó un correo válido',
      icon: 'error',
      timer: 2000
    });
    return;
  }
  
  // Asegúrate de codificar el email correctamente
  const encodedEmail = encodeURIComponent(email);
  console.log('Navegando a edición con email:', email, 'Codificado:', encodedEmail);
  
  this._router.navigate(['/update-user', encodedEmail]);
}


  searchAndNavigate(): void {
  const query = this.searchQuery.trim();
  if (query !== '') {
    this._router.navigate(['/show-user', query]);
  } else {
    Swal.fire({
      title: 'Por favor ingrese un correo válido',
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false
    });
  }
}


  confirmDelete(email: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.destroy(email);
      }
    });
  }

  destroy(email: string): void {
    this._userService.destroyUser(email).subscribe(
      response => {
        if (response.status === 200) {
          this.users = this.users.filter(user => user.email !== email);
          this.filteredUsers = this.filteredUsers.filter(user => user.email !== email);
          this.showAlertSuccess('success', response.message);
        } else {
          this.showAlert('error', 'No se pudo eliminar el usuario');
        }
      },
      error => {
        console.error('Error al eliminar usuario:', error);
        this.showAlert('error', 'Hubo un error al eliminar el usuario');
      }
    );
  }

  showAlert(type: 'error', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 1500,
      showConfirmButton: false
    });
  }

  showAlertSuccess(type: 'success', message: string): void {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: true
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        location.reload();
      }
    });
  }
}
