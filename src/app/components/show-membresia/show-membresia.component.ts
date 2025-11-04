import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { MembresiaResponse } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-membresia',
  templateUrl: './show-membresia.component.html',
  styleUrls: ['./show-membresia.component.css']
})
export class ShowMembresiaComponent implements OnInit {
  public membresia: MembresiaResponse | null = null;
  public isLoading: boolean = false;
  public Math = Math; // Para usar Math.abs en el template

  constructor(
    private _membresiaService: MembresiaService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMembresia(Number(id));
      }
    });
  }

  loadMembresia(id: number): void {
    this.isLoading = true;
    this._membresiaService.getMembresia(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.membresia = response.data;
        } else {
          this.showAlert('error', 'Membresía no encontrada');
          this._router.navigate(['/view-membresia']);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener membresía:', error);
        this.showAlert('error', 'Error al obtener los datos de la membresía');
        this._router.navigate(['/view-membresia']);
        this.isLoading = false;
      }
    });
  }

  // Funciones de utilidad para mostrar datos
  getEstadoTexto(): string {
    if (!this.membresia) return '';
    
    // Convertir estado a número para comparación correcta
    const estado = parseInt(String(this.membresia.estado), 10);
    const esPlantilla = parseInt(String(this.membresia.esPlantilla), 10) === 1;
    
    if (esPlantilla) {
      return estado === 1 ? 'Disponible' : 'No Disponible';
    }
    return estado === 1 ? 'Activa' : 'Inactiva';
  }

  getPrecioFormateado(precio: number | string): string {
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    return '₡' + Number(precioNum).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  hasDescuento(): boolean {
    return !!(this.membresia?.descuento && parseFloat(this.membresia.descuento) > 0);
  }

  esPlantilla(): boolean {
    return parseInt(String(this.membresia?.esPlantilla), 10) === 1;
  }

  // Método para verificar si está activa (para usar en el HTML)
  estaActiva(): boolean {
    return parseInt(String(this.membresia?.estado), 10) === 1;
  }

  getPrecioFinal(): number {
    if (!this.membresia) return 0;
    const precio = parseFloat(this.membresia.precio);
    const descuento = parseFloat(this.membresia.descuento || "0");
    
    if (descuento > 0) {
      return precio * (1 - descuento / 100);
    }
    return precio;
  }

  isVencida(): boolean {
    if (!this.membresia || !this.membresia.fechaVenc || parseInt(String(this.membresia.esPlantilla), 10) === 1) return false;
    return new Date(this.membresia.fechaVenc) < new Date();
  }

  vencePronto(): boolean {
    if (!this.membresia || !this.membresia.fechaVenc || parseInt(String(this.membresia.esPlantilla), 10) === 1) return false;
    const hoy = new Date();
    const vencimiento = new Date(this.membresia.fechaVenc);
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes > 0;
  }

  getDiasRestantes(): number {
    if (!this.membresia || !this.membresia.fechaVenc || parseInt(String(this.membresia.esPlantilla), 10) === 1) return 0;
    const hoy = new Date();
    const vencimiento = new Date(this.membresia.fechaVenc);
    return Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  getEstadoPagoClass(): string {
    if (!this.membresia) return 'badge-secondary';
    
    const estadoPago = this.membresia.estado_pago || 
      (this.isPagada() ? 'Pagada' : 'Pendiente de pago');
    
    switch (estadoPago) {
      case 'Pagada':
        return 'badge-success';
      case 'Pendiente de pago':
        return 'badge-warning';
      case 'No aplica':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  isPagada(): boolean {
    if (!this.membresia) return false;
    return this.membresia.pagada === true || 
           (this.membresia.pagada as any) === 1 || 
           (this.membresia.pagada as any) === '1';
  }

  editMembresia(): void {
    if (this.membresia) {
      this._router.navigate(['/update-membresia', this.membresia.idMembresia]);
    }
  }

  deleteMembresia(): void {
    if (!this.membresia) return;

    const tipo = parseInt(String(this.membresia.esPlantilla), 10) === 1 ? 'plantilla' : 'membresía';
    const nombre = this.membresia.nombre || this.membresia.tipoMem;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la ${tipo} "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.membresia) {
        this._membresiaService.deleteMembresia(parseInt(this.membresia.idMembresia)).subscribe({
          next: (response: any) => {
            this.showAlert('success', `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminada correctamente`, () => {
              this._router.navigate(['/view-membresia']);
            });
          },
          error: (error: any) => {
            console.error(`Error al eliminar ${tipo}:`, error);
            this.showAlert('error', `Error al eliminar la ${tipo}`);
          }
        });
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/view-membresia']);
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