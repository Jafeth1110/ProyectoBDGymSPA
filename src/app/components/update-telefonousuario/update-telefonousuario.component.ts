import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TelefonoService } from '../../services/telefono.service';
import { Telefono, TelefonoRequest } from '../../models/telefono';
import { ValidationService } from '../../services/validation.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-telefonousuario',
  templateUrl: './update-telefonousuario.component.html',
  styleUrls: ['./update-telefonousuario.component.css']
})
export class UpdateTelefonousuarioComponent implements OnInit {
  telefono: Telefono | null = null;
  telefonoUpdate: TelefonoRequest = {
    idUsuario: 0,
    telefono: '',
    tipoTel: 'celular'
  };
  validationErrors: string[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private telefonoService: TelefonoService,
    private validationService: ValidationService
  ) { }

  ngOnInit(): void {
    this.loadTelefono();
  }

  loadTelefono(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.telefonoService.getTelefono(id).subscribe({
        next: (response) => {
          console.log('📞 Respuesta completa update:', response);
          this.telefono = response.data as Telefono;
          console.log('✅ Teléfono cargado para update:', this.telefono);
          console.log('👤 Usuario (user) en update:', this.telefono.user);
          console.log('👤 Usuario (usuario) en update:', this.telefono.usuario);
          // Initialize the update form with current values
          this.telefonoUpdate = {
            idUsuario: this.telefono.idUsuario,
            telefono: this.telefono.telefono,
            tipoTel: this.telefono.tipoTel as 'celular' | 'casa' | 'trabajo'
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading phone:', error);
          this.validationErrors = ['Error al cargar los datos del teléfono'];
          this.loading = false;
        }
      });
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid && this.telefono) {
      this.validationErrors = [];
      
      // Validate phone number
      const phoneValidation = this.validationService.validateTelefono(this.telefonoUpdate.telefono);
      if (!phoneValidation.valid) {
        this.validationErrors = [phoneValidation.message || 'Número de teléfono inválido'];
        return;
      }

      this.loading = true;
      
      // Create update payload without idUsuario since it's read-only
      const updateData = {
        telefono: this.telefonoUpdate.telefono,
        tipoTel: this.telefonoUpdate.tipoTel
      };

      this.telefonoService.updateTelefono(this.telefono.idTelefono, updateData).subscribe({
        next: (response) => {
          console.log('Phone updated successfully:', response);
          Swal.fire({
            title: '¡Éxito!',
            text: 'Teléfono actualizado exitosamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/view-telefonousuario']);
          });
        },
        error: (error) => {
          console.error('Error updating phone:', error);
          this.loading = false;
          
          let errorMessage = 'Error al actualizar el teléfono. Por favor, intente nuevamente.';
          
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
    }
  }

  back(): void {
    this.location.back();
  }
}
