import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TelefonoService } from '../../services/telefono.service';
import { UserService } from '../../services/user.service';
import { TelefonoRequest } from '../../models/telefono';
import { User } from '../../models/user';
import { ValidationService } from '../../services/validation.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-telefonousuario',
  templateUrl: './add-telefonousuario.component.html',
  styleUrls: ['./add-telefonousuario.component.css']
})
export class AddTelefonousuarioComponent implements OnInit {
  telefono: TelefonoRequest = {
    idUsuario: 0,
    telefono: '',
    tipoTel: 'celular'
  };
  users: User[] = [];
  validationErrors: string[] = [];
  loading = false;
  loadingUsers = false;

  constructor(
    private router: Router,
    private location: Location,
    private telefonoService: TelefonoService,
    private userService: UserService,
    private validationService: ValidationService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    console.log('🔄 Cargando usuarios...');
    this.userService.getUsers().subscribe({
      next: (response) => {
        console.log('📥 Respuesta completa:', response);
        if (response && response.users) {
          // El backend devuelve 'users', no 'data'
          this.users = response.users as User[];
          console.log('👥 Usuarios cargados:', this.users);
        } else if (response && response.data) {
          this.users = response.data as User[];
          console.log('👥 Usuarios cargados (data):', this.users);
        } else if (Array.isArray(response)) {
          this.users = response as User[];
          console.log('👥 Usuarios cargados (array directo):', this.users);
        } else {
          console.error('❌ Formato de respuesta inesperado:', response);
          this.validationErrors = ['Formato de respuesta inesperado del servidor'];
        }
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.validationErrors = ['Error al cargar la lista de usuarios'];
        this.loadingUsers = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.valid && this.telefono.idUsuario > 0) {
      this.validationErrors = [];
      
      // Validate phone number
      const phoneValidation = this.validationService.validateTelefono(this.telefono.telefono);
      if (!phoneValidation.valid) {
        this.validationErrors = [phoneValidation.message || 'Número de teléfono inválido'];
        return;
      }

      // Validate phone type
      const typeValidation = this.validationService.validateTipoTelefono(this.telefono.tipoTel);
      if (!typeValidation.valid) {
        this.validationErrors = [typeValidation.message || 'Tipo de teléfono inválido'];
        return;
      }

      this.loading = true;

      this.telefonoService.createTelefono(this.telefono).subscribe({
        next: (response) => {
          console.log('Phone created successfully:', response);
          Swal.fire({
            title: '¡Éxito!',
            text: 'Teléfono creado exitosamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/view-telefonousuario']);
          });
        },
        error: (error) => {
          console.error('Error creating phone:', error);
          this.loading = false;
          
          let errorMessage = 'Error al crear el teléfono. Por favor, intente nuevamente.';
          
          if (error.error?.errors) {
            this.validationErrors = Object.values(error.error.errors).flat() as string[];
            errorMessage = this.validationErrors[0];
          } else if (error.error?.message) {
            this.validationErrors = [error.error.message];
            errorMessage = error.error.message;
          } else {
            this.validationErrors = [errorMessage];
          }

          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      });
    } else {
      this.validationErrors = ['Por favor, complete todos los campos requeridos'];
    }
  }

  back(): void {
    this.location.back();
  }

  getUserDisplayName(user: User): string {
    return `${user.nombre} ${user.apellido} (${user.email})`;
  }
}
