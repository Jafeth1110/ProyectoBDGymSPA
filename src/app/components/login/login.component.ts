import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;

        const token = res.token || res.data?.token;

        if (token) {
          // Obtener identidad con el token
          this.authService.getIdentityFromApi(token).subscribe({
            next: (identityRes) => {
              const identity = identityRes.user || {};
              this.authService.saveSession(token, identity);
              this.showAlert('success', '¡Bienvenido!');
              this.router.navigate(['/home']);
            },
            error: () => {
              this.showAlert('error', 'Error al obtener identidad');
            }
          });
        } else {
          this.showAlert('error', res.message || 'Credenciales incorrectas');
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });

  }


  private handleError(err: any) {
    console.error('Error completo:', err);

    let errorMsg = 'Error en el servidor';

    if (err.error) {
      // Si el error viene como texto plano (string)
      if (typeof err.error === 'string') {
        try {
          const parsedError = JSON.parse(err.error);
          errorMsg = parsedError.message || errorMsg;
        } catch {
          errorMsg = err.error;
        }
      }
      // Si el error es un objeto JSON
      else if (err.error.message) {
        errorMsg = err.error.message;
      } else if (err.error.error) {
        errorMsg = err.error.error;
      }
    }

    this.showAlert('error', errorMsg);
  }

  showAlert(icon: 'success' | 'error', title: string) {
    Swal.fire({
      icon,
      title,
      showConfirmButton: false,
      timer: 2000
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  goToRegister() {
    this.router.navigate(['/signup']);
  }
}