// signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ValidationService } from '../../services/validation.service';
import { UserRegistrationData, ROLES, TIPOS_TELEFONO } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  public signupForm: FormGroup;
  public validationErrors: string[] = [];
  public loading = false;
  public tiposTelefono = TIPOS_TELEFONO;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.signupForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{6,}$/)]],
      confirmPassword: ['', Validators.required],
      telefonos: this.fb.array([])
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar contraseña
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  get telefonos(): FormArray {
    return this.signupForm.get('telefonos') as FormArray;
  }

  // Agregar teléfono
  addTelefono() {
    const telefonoGroup = this.fb.group({
      telefono: ['', [Validators.pattern(/^\d{8,12}$/)]],
      tipoTel: ['celular', Validators.required]
    });
    
    this.telefonos.push(telefonoGroup);
  }

  // Remover teléfono
  removeTelefono(index: number) {
    this.telefonos.removeAt(index);
  }

  onSubmit(): void {
    this.validationErrors = [];
    
    if (this.signupForm.invalid || this.loading) {
      this.markFormGroupTouched(this.signupForm);
      this.showAlert('error', 'Por favor, corrige los errores en el formulario');
      return;
    }

    this.loading = true;
    const formData = this.signupForm.value;

    // Preparar datos de usuario
    const userData: UserRegistrationData = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      cedula: formData.cedula.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      idRol: ROLES.CLIENTE // Siempre registrar como cliente
    };

    // Agregar teléfonos válidos si existen
    const telefonosValidos = formData.telefonos.filter((tel: any) => 
      tel.telefono && tel.telefono.trim() !== ''
    );

    if (telefonosValidos.length > 0) {
      userData.telefonos = telefonosValidos;
    }

    // Registrar usuario
    this.authService.register(userData).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.status === 201 || response.status === 200) {
          this.showAlert('success', 'Usuario registrado correctamente');
          this.router.navigate(['/login']);
        } else {
          this.showAlert('error', response.message || 'No se pudo registrar el usuario');
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  private handleError(error: any) {
    console.error('Error en registro:', error);
    
    const errorMessage = this.errorHandler.formatErrorMessage(error);
    
    if (this.errorHandler.isValidationError(error)) {
      const errorMessages = this.errorHandler.extractErrorMessages(error);
      this.validationErrors = errorMessages;
      this.showValidationErrors(errorMessages);
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

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
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

  // Getters para validación en template
  get nombre() { return this.signupForm.get('nombre'); }
  get apellido() { return this.signupForm.get('apellido'); }
  get cedula() { return this.signupForm.get('cedula'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
