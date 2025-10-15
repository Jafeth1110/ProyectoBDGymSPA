import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MetodoPagoService } from '../../services/metodoPago.service';
import { MetodoPago } from '../../models/metodoPago';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-metodopago',
  templateUrl: './view-metodopago.component.html',
  styleUrls: ['./view-metodopago.component.css']
})
export class ViewMetodopagoComponent implements OnInit {
  public metodosPago: MetodoPago[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';
  public filteredMetodosPago: MetodoPago[] = [];

  constructor(
    private _metodoPagoService: MetodoPagoService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadMetodosPago();
  }

  loadMetodosPago(): void {
    this.isLoading = true;
    this._metodoPagoService.getMetodosPago().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.metodosPago = response.data.map((metodoData: any) => 
            this._metodoPagoService.mapResponseToModel(metodoData)
          );
          this.filteredMetodosPago = [...this.metodosPago];
        } else {
          this.metodosPago = [];
          this.filteredMetodosPago = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar métodos de pago:', error);
        this.showAlert('error', 'Error al cargar los métodos de pago');
        this.isLoading = false;
      }
    });
  }

  filterMetodosPago(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMetodosPago = [...this.metodosPago];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredMetodosPago = this.metodosPago.filter(metodo =>
        metodo.nombre.toLowerCase().includes(term) ||
        metodo.descripcion.toLowerCase().includes(term) ||
        metodo.getEstadoTexto().toLowerCase().includes(term)
      );
    }
  }

  addMetodoPago(): void {
    this._router.navigate(['/add-metodopago']);
  }

  viewMetodoPago(id: number): void {
    this._router.navigate(['/show-metodopago', id]);
  }

  editMetodoPago(id: number): void {
    this._router.navigate(['/update-metodopago', id]);
  }

  deleteMetodoPago(metodo: MetodoPago): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el método de pago "${metodo.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._metodoPagoService.deleteMetodoPago(metodo.idMetodoPago).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Método de pago eliminado correctamente');
            this.loadMetodosPago();
          },
          error: (error: any) => {
            console.error('Error al eliminar método de pago:', error);
            this.showAlert('error', 'Error al eliminar el método de pago');
          }
        });
      }
    });
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
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

    Swal.fire(config);
  }
}