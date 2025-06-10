import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-mantenimiento',
  templateUrl: './show-mantenimiento.component.html',
  styleUrls: ['./show-mantenimiento.component.css'],
  providers: [MantenimientoService]
})
export class ShowMantenimientoComponent implements OnInit {
  public mantenimiento: Mantenimiento | null = null;

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

  loadMantenimiento(id: number): void {
    this._mantenimientoService.showMantenimiento(id).subscribe(
      response => {
        if (response?.mantenimiento) {
          const m = response.mantenimiento;
          this.mantenimiento = new Mantenimiento(
            m.idMantenimiento,
            m.descripcion,
            m.costo
          );
        } else {
          this.showAlert('error', 'Mantenimiento no encontrado');
          this._router.navigate(['/view-mantenimiento']);
        }
      },
      error => {
        console.error('Error al obtener mantenimiento:', error);
        this.showAlert('error', 'Error al obtener los datos del mantenimiento');
        this._router.navigate(['/view-mantenimiento']);
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
    this._router.navigate(['/view-mantenimiento']);
  }
}
