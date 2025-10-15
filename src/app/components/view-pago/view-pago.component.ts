import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { Pago } from '../../models/pago';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-pago',
  templateUrl: './view-pago.component.html',
  styleUrls: ['./view-pago.component.css']
})
export class ViewPagoComponent implements OnInit {
  public pagos: Pago[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';
  public filteredPagos: Pago[] = [];
  public selectedEstado: string = '';

  constructor(
    private _pagoService: PagoService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    this.isLoading = true;
    this._pagoService.getPagos().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.pagos = response.data.map((pagoData: any) => 
            this._pagoService.mapResponseToModel(pagoData)
          );
          this.filteredPagos = [...this.pagos];
        } else {
          this.pagos = [];
          this.filteredPagos = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar pagos:', error);
        this.showAlert('error', 'Error al cargar los pagos');
        this.isLoading = false;
      }
    });
  }

  filterPagos(): void {
    let filtered = [...this.pagos];

    // Filtro por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pago =>
        pago.monto.toString().includes(term) ||
        pago.fechaPago.toLowerCase().includes(term) ||
        pago.estado.toLowerCase().includes(term) ||
        pago.referencia.toLowerCase().includes(term) ||
        (pago.notas && pago.notas.toLowerCase().includes(term)) ||
        (pago.cliente && pago.getNombreCliente().toLowerCase().includes(term))
      );
    }

    // Filtro por estado
    if (this.selectedEstado) {
      filtered = filtered.filter(pago => 
        pago.estado.toLowerCase() === this.selectedEstado.toLowerCase()
      );
    }

    this.filteredPagos = filtered;
  }

  onEstadoChange(): void {
    this.filterPagos();
  }

  addPago(): void {
    this._router.navigate(['/add-pago']);
  }

  viewPago(id: number): void {
    this._router.navigate(['/show-pago', id]);
  }

  editPago(id: number): void {
    this._router.navigate(['/update-pago', id]);
  }

  deletePago(pago: Pago): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el pago de ${pago.getMontoFormateado()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._pagoService.deletePago(pago.idPago).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Pago eliminado correctamente');
            this.loadPagos();
          },
          error: (error: any) => {
            console.error('Error al eliminar pago:', error);
            this.showAlert('error', 'Error al eliminar el pago');
          }
        });
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEstado = '';
    this.filterPagos();
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'fallido':
        return 'danger';
      default:
        return 'secondary';
    }
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