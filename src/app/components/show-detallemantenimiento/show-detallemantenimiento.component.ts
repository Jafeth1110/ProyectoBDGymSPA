import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetalleMantenimientoService } from '../../services/detalleMantenimiento.service';
import { DetalleMantenimiento } from '../../models/detalleMantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-detallemantenimiento',
  templateUrl: './show-detallemantenimiento.component.html',
  styleUrls: ['./show-detallemantenimiento.component.css'],
  providers: [DetalleMantenimientoService]
})
export class ShowDetallemantenimientoComponent implements OnInit {
  public detalle: DetalleMantenimiento | null = null;

  constructor(
    private _detalleService: DetalleMantenimientoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadDetalle(id);
      }
    });
  }

  loadDetalle(id: number): void {
    this._detalleService.showDetalle(id).subscribe(
      response => {
        if (response?.detalle) {
          const d = response.detalle;
          this.detalle = new DetalleMantenimiento(
            d.idDetalleMantenimiento,
            d.idAdmin,
            d.idEquipo,
            d.idMantenimiento,
            d.fechaMantenimiento
          );
        } else {
          this.showAlert('error', 'Detalle de mantenimiento no encontrado');
          this._router.navigate(['/view-detallemantenimiento']);
        }
      },
      error => {
        console.error('Error al obtener detalle:', error);
        this.showAlert('error', 'Error al obtener los datos del detalle');
        this._router.navigate(['/view-detallemantenimiento']);
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
    this._router.navigate(['/view-detallemantenimiento']);
  }
}