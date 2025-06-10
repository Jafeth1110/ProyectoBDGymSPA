import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-mantenimiento',
  templateUrl: './update-mantenimiento.component.html',
  styleUrls: ['./update-mantenimiento.component.css'],
  providers: [MantenimientoService]
})
export class UpdateMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento = new Mantenimiento();
  public validationErrors: string[] = [];

  constructor(
    private _mantenimientoService: MantenimientoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMantenimiento(id);
      }
    });
  }

  private loadMantenimiento(id: number): void {
    this._mantenimientoService.showMantenimiento(id).subscribe({
      next: res => {
        if (res.status === 200 && res.mantenimiento) {
          this.mantenimiento = res.mantenimiento;
        } else {
          this.showAlert('error', 'Mantenimiento no encontrado');
          this._router.navigate(['/view-mantenimiento']);
        }
      },
      error: err => {
        this.showAlert('error', 'Error al cargar el mantenimiento');
        this._router.navigate(['/view-mantenimiento']);
      }
    });
  }

  public updateMantenimiento(): void {
    if (!this.mantenimiento.descripcion || this.mantenimiento.costo == null) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    const dataToSend = {
      descripcion: this.mantenimiento.descripcion,
      costo: this.mantenimiento.costo
    };

    this._mantenimientoService.updateMantenimiento(this.mantenimiento.idMantenimiento, { data: dataToSend }).subscribe({
      next: res => {
        if (res.status === 200) {
          this.showAlert('success', 'Mantenimiento actualizado correctamente');
          this._router.navigate(['/view-mantenimiento']);
        } else {
          this.showAlert('error', res.message || 'No se pudo actualizar el mantenimiento');
        }
      },
      error: err => {
        this.showAlert('error', 'Error al actualizar el mantenimiento');
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

  cancel(): void {
    this._router.navigate(['/view-mantenimiento']);
  }
}
