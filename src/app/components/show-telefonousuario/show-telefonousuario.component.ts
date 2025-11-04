import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TelefonoService } from '../../services/telefono.service';
import { Telefono } from '../../models/telefono';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-telefonousuario',
  templateUrl: './show-telefonousuario.component.html',
  styleUrls: ['./show-telefonousuario.component.css'],
  providers: [TelefonoService]
})
export class ShowTelefonousuarioComponent implements OnInit {
  public telefono: Telefono | null = null;

  constructor(
    private _telefonoService: TelefonoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadTelefono(parseInt(id));
      } else {
        this.showAlert('error', 'ID de teléfono no encontrado');
        this._router.navigate(['/view-telefonousuario']);
      }
    });
  }

  loadTelefono(id: number): void {
    console.log('🔍 Cargando teléfono ID:', id);
    
    this._telefonoService.getTelefono(id).subscribe({
      next: (response) => {
        console.log('📞 Respuesta del teléfono:', response);
        
        if (response?.data && !Array.isArray(response.data)) {
          this.telefono = response.data as Telefono;
          console.log('✅ Teléfono cargado:', this.telefono);
          console.log('👤 Usuario (user):', this.telefono.user);
          console.log('👤 Usuario (usuario):', this.telefono.usuario);
          console.log('🏷️ Rol:', this.telefono.rol);
        } else {
          this.showAlert('error', 'Teléfono no encontrado');
          this._router.navigate(['/view-telefonousuario']);
        }
      },
      error: (error) => {
        console.error('❌ Error al obtener teléfono:', error);
        this.showAlert('error', 'Error al obtener los datos del teléfono');
        this._router.navigate(['/view-telefonousuario']);
      }
    });
  }

  editTelefono(): void {
    if (this.telefono) {
      this._router.navigate([
        '/update-telefonousuario',
        this.telefono.idTelefono,
        this.telefono.tipoTel
      ]);
    }
  }

  deleteTelefono(): void {
    if (!this.telefono) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el teléfono "${this.telefono.telefono}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.telefono) {
        this._telefonoService.deleteTelefono(this.telefono.idTelefono).subscribe(
          response => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El teléfono ha sido eliminado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this._router.navigate(['/view-telefonousuario']);
          },
          error => {
            console.error('Error al eliminar teléfono:', error);
            this.showAlert('error', 'Error al eliminar el teléfono');
          }
        );
      }
    });
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
    this._router.navigate(['/view-telefonousuario']);
  }
}