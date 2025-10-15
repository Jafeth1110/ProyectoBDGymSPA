import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { Pago } from '../../models/pago';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-pago',
  templateUrl: './show-pago.component.html',
  styleUrls: ['./show-pago.component.css']
})
export class ShowPagoComponent implements OnInit {
  public pago: Pago | null = null;
  public isLoading: boolean = false;

  constructor(
    private _pagoService: PagoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadPago(Number(id));
      }
    });
  }

  loadPago(id: number): void {
    this.isLoading = true;
    this._pagoService.getPago(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.pago = this._pagoService.mapResponseToModel(response.data);
        } else {
          this.showAlert('error', 'Pago no encontrado');
          this._router.navigate(['/view-pago']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener pago:', error);
        this.showAlert('error', 'Error al obtener los datos del pago');
        this._router.navigate(['/view-pago']);
        this.isLoading = false;
      }
    });
  }

  editPago(): void {
    if (this.pago) {
      this._router.navigate(['/update-pago', this.pago.idPago]);
    }
  }

  deletePago(): void {
    if (!this.pago) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el pago con referencia "${this.pago.referencia}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.pago) {
        this._pagoService.deletePago(this.pago.idPago).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Pago eliminado correctamente', () => {
              this._router.navigate(['/view-pago']);
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar pago:', error);
            this.showAlert('error', 'Error al eliminar el pago');
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-pago']);
  }

  getEstadoClass(estado?: string): string {
    switch(estado?.toLowerCase()) {
      case 'completado':
        return 'capacity';
      case 'pendiente':
        return 'pending';
      case 'cancelado':
      case 'reembolsado':
        return 'inactive';
      default:
        return '';
    }
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