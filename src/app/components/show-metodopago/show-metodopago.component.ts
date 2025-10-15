import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { MetodoPago } from '../../models/metodoPago';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-metodopago',
  templateUrl: './show-metodopago.component.html',
  styleUrls: ['./show-metodopago.component.css']
})
export class ShowMetodopagoComponent implements OnInit {
  public metodoPago: MetodoPago | null = null;
  public isLoading: boolean = false;

  constructor(
    private _metodoPagoService: MetodoPagoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMetodoPago(Number(id));
      }
    });
  }

  loadMetodoPago(id: number): void {
    this.isLoading = true;
    this._metodoPagoService.getMetodoPago(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.metodoPago = this._metodoPagoService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Método de pago no encontrado');
          this._router.navigate(['/view-metodopago']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener método de pago:', error);
        this.showAlert('error', 'Error al obtener los datos del método de pago');
        this._router.navigate(['/view-metodopago']);
        this.isLoading = false;
      }
    });
  }

  editMetodoPago(): void {
    if (this.metodoPago) {
      this._router.navigate(['/update-metodopago', this.metodoPago.idMetodoPago]);
    }
  }

  deleteMetodoPago(): void {
    if (!this.metodoPago) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el método de pago "${this.metodoPago.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.metodoPago) {
        this._metodoPagoService.deleteMetodoPago(this.metodoPago.idMetodoPago).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Método de pago eliminado correctamente', () => {
              this._router.navigate(['/view-metodopago']);
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar método de pago:', error);
            this.showAlert('error', 'Error al eliminar el método de pago');
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-metodopago']);
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string, callback?: () => void): void {
    const config: any = {
      title: type === 'success' ? '¡Éxito!' : type === 'error' ? '¡Error!' : '¡Atención!',
      text: message,
      icon: type,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#28a745'
    };

    if (type === 'error') {
      config.confirmButtonColor = '#dc3545';
    }

    Swal.fire(config).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }
}