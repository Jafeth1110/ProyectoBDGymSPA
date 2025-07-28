import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
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
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.handleLoginSuccess(res);
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  private handleLoginSuccess(res: any) {
    console.log('Iniciando handleLoginSuccess con:', res);
    this.loading = false;

    if (res.token) {
      console.log('Token encontrado, obteniendo identidad...');
      
      // Obtener identidad del usuario
      this.authService.getIdentityFromApi(res.token).subscribe({
        next: (identityRes) => {
          console.log('Respuesta de getIdentityFromApi:', identityRes);
          
          // Verificar diferentes formatos de respuesta del backend
          const identity = identityRes?.data || identityRes?.user || identityRes;
          
          if (identity && (identity.email || identity.idUsuario)) {
            console.log('Identidad válida encontrada:', identity);
            
            // Guardar sesión completa
            this.authService.saveSession(res.token, identity);
            
            console.log('Sesión guardada, mostrando mensaje...');
            
            // Mostrar SweetAlert y luego navegar
            this.showAlert('success', '¡Bienvenido!');
            
            // Navegar después de un pequeño delay
            setTimeout(() => {
              console.log('Navegando a /home...');
              this.router.navigate(['/home']).then(
                success => console.log('Navegación exitosa:', success),
                error => console.error('Error en navegación:', error)
              );
            }, 1500);
            
          } else {
            console.error('Identidad inválida:', identity);
            this.showAlert('error', 'Error al obtener datos de usuario');
          }
        },
        error: (error) => {
          console.error('Error obteniendo identidad:', error);
          this.showAlert('error', 'Error al obtener datos de usuario');
        }
      });
    } else {
      console.error('No se encontró token en la respuesta');
      this.showAlert('error', res.message || 'Credenciales incorrectas');
    }
  }

  private handleError(err: any) {
    console.error('Error completo:', err);
    
    const errorMessage = this.errorHandler.formatErrorMessage(err);
    
    // Si es error de validación, mostrar los detalles
    if (this.errorHandler.isValidationError(err)) {
      const errorMessages = this.errorHandler.extractErrorMessages(err);
      this.showValidationErrors(errorMessages);
    } else if (this.errorHandler.isAuthError(err)) {
      this.showAlert('error', 'Credenciales incorrectas. Verifica tu email y contraseña.');
    } else {
      this.showAlert('error', errorMessage);
    }
  }

  private showValidationErrors(errors: string[]) {
    const errorList = errors.map(error => `• ${error}`).join('<br>');
    Swal.fire({
      icon: 'error',
      title: 'Errores de validación',
      html: errorList,
      confirmButtonText: 'Entendido'
    });
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