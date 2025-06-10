import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-equipo',
  templateUrl: './show-equipo.component.html',
  styleUrls: ['./show-equipo.component.css'],
  providers: [EquipoService]
})
export class ShowEquipoComponent implements OnInit {
  public equipo: Equipo | null = null;

  constructor(
    private _equipoService: EquipoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEquipo(id);
      }
    });
  }

  loadEquipo(id: number): void {
    this._equipoService.showEquipo(id).subscribe(
      response => {
        if (response?.equipo) {
          const e = response.equipo;
          this.equipo = new Equipo(
            e.idEquipo,
            e.nombre,
            e.tipo,
            e.estado,
            e.cantidad
          );
        } else {
          this.showAlert('error', 'Equipo no encontrado');
          this._router.navigate(['/view-equipo']);
        }
      },
      error => {
        console.error('Error al obtener equipo:', error);
        this.showAlert('error', 'Error al obtener los datos del equipo');
        this._router.navigate(['/view-equipo']);
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
    this._router.navigate(['/view-equipo']);
  }
}
