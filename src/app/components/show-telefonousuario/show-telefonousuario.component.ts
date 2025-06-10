import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TelefonoUsuarioService } from '../../services/telefonoUsuario.service';
import { TelefonoUsuario } from '../../models/telefonoUsuario';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-telefonousuario',
  templateUrl: './show-telefonousuario.component.html',
  styleUrls: ['./show-telefonousuario.component.css'],
  providers: [TelefonoUsuarioService]
})
export class ShowTelefonousuarioComponent implements OnInit {
  public telefono: TelefonoUsuario | null = null;

  constructor(
    private _telefonoUsuarioService: TelefonoUsuarioService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadTelefono(id);
      }
    });
  }

  loadTelefono(id: number): void {
    this._telefonoUsuarioService.showTelefono(id).subscribe(
      response => {
        if (response?.telefono) {
          const t = response.telefono;
          this.telefono = new TelefonoUsuario(
            t.idTelefonoUsuario,
            t.idUsuario,
            t.tipoTel,
            t.telefono
          );
        } else {
          this.showAlert('error', 'Teléfono no encontrado');
          this._router.navigate(['/view-telefonousuario']);
        }
      },
      error => {
        console.error('Error al obtener teléfono:', error);
        this.showAlert('error', 'Error al obtener los datos del teléfono');
        this._router.navigate(['/view-telefonousuario']);
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
    this._router.navigate(['/view-telefonousuario']);
  }
}