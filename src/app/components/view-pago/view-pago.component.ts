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
  public selectedTipoPago: string = ''; // Nueva propiedad para filtrar por tipo de pago

  constructor(
    private _pagoService: PagoService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    this.isLoading = true;
    console.log('🔄 Iniciando carga de pagos...');
    
    this._pagoService.getPagos().subscribe({
      next: (response: any) => {
        console.log('📥 Respuesta del servidor:', response);
        
        // Más flexible en el manejo de la respuesta
        if (response && response.data && Array.isArray(response.data)) {
          console.log('✅ Datos válidos recibidos:', response.data.length, 'pagos');
          
          try {
            this.pagos = response.data.map((pagoData: any, index: number) => {
              console.log(`🔄 Procesando pago ${index + 1}:`, pagoData);
              return this._pagoService.mapResponseToModel(pagoData);
            });
            
            this.filteredPagos = [...this.pagos];
            console.log('✅ Pagos procesados exitosamente:', this.pagos.length);
            
          } catch (mappingError) {
            console.error('❌ Error al mapear los datos:', mappingError);
            this.showAlert('error', 'Error al procesar los datos de pagos');
          }
          
        } else if (response && response.data && response.data.length === 0) {
          console.log('ℹ️ No hay pagos en la base de datos');
          this.pagos = [];
          this.filteredPagos = [];
          
        } else {
          console.log('⚠️ Respuesta no válida del servidor:', response);
          this.pagos = [];
          this.filteredPagos = [];
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error completo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Error de conexión con el servidor';
        if (error.status === 401) {
          errorMessage = 'No autorizado - Token inválido';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor';
        } else if (error.status === 0) {
          errorMessage = 'No se puede conectar al servidor';
        }
        
        this.showAlert('error', errorMessage);
        this.isLoading = false;
      }
    });
  }

  filterPagos(): void {
    let filtered = [...this.pagos];

    // Filtro por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pago => {
        const searchableText = [
          pago.monto.toString(),
          pago.fechaPago,
          pago.getNombreDescriptivo(), // Incluye tanto cliente como equipo
          pago.getTipoMembresia(),
          pago.getNombreMetodoPago(),
          pago.cliente_email || '',
          pago.equipo_nombre || '',
          pago.mantenimiento_descripcion || '',
          pago.descripcion || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(term);
      });
    }

    // Filtro por tipo de pago (ingresos/gastos)
    if (this.selectedTipoPago) {
      filtered = filtered.filter(pago => pago.tipoPago === this.selectedTipoPago);
    }

    // Filtro por tipo de membresía o período (usando selectedEstado como filtro general)
    if (this.selectedEstado) {
      filtered = filtered.filter(pago => 
        pago.getTipoMembresia().toLowerCase().includes(this.selectedEstado.toLowerCase())
      );
    }

    this.filteredPagos = filtered;
  }

  onEstadoChange(): void {
    this.filterPagos();
  }

  onTipoPagoChange(): void {
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
    this.selectedTipoPago = '';
    this.filterPagos();
  }

  // Método para determinar si un pago es reciente (del mes actual)
  isRecentPayment(pago: Pago): boolean {
    return pago.esDeMesActual();
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