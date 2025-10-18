import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import { MembresiaResponse } from '../../models/api-interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-membresia',
  templateUrl: './view-membresia.component.html',
  styleUrls: ['./view-membresia.component.css']
})
export class ViewMembresiaComponent implements OnInit {
  public membresias: MembresiaResponse[] = [];
  public plantillas: MembresiaResponse[] = [];
  public isLoading: boolean = false;
  public isLoadingPlantillas: boolean = false;
  public searchTerm: string = '';
  public filteredMembresias: MembresiaResponse[] = [];
  public filteredPlantillas: MembresiaResponse[] = [];
  public activeTab: 'clientes' | 'plantillas' = 'clientes';
  public Math = Math; // Para usar Math.abs en el template

  constructor(
    private _membresiaService: MembresiaService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.isLoadingPlantillas = true;
    
    this._membresiaService.getMembresias().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // Filtrar membresías de clientes: las que NO son plantillas y tienen idCliente
          this.membresias = response.data.filter((m: any) => {
            const esPlantilla = String(m.esPlantilla) === "1";
            return !esPlantilla && m.idCliente !== null && m.idCliente !== undefined && m.idCliente !== '';
          });
          
          // Filtrar plantillas: las que SÍ son plantillas
          this.plantillas = response.data.filter((m: any) => {
            const esPlantilla = String(m.esPlantilla) === "1";
            return esPlantilla;
          });
          
          this.filteredMembresias = [...this.membresias];
          this.filteredPlantillas = [...this.plantillas];
        } else {
          this.membresias = [];
          this.filteredMembresias = [];
          this.plantillas = [];
          this.filteredPlantillas = [];
        }
        this.isLoading = false;
        this.isLoadingPlantillas = false;
      },
      error: (error: any) => {
        console.error('Error al cargar datos:', error);
        this.showAlert('error', 'Error al cargar las membresías');
        this.membresias = [];
        this.filteredMembresias = [];
        this.plantillas = [];
        this.filteredPlantillas = [];
        this.isLoading = false;
        this.isLoadingPlantillas = false;
      }
    });
  }

  switchTab(tab: 'clientes' | 'plantillas'): void {
    this.activeTab = tab;
    this.searchTerm = '';
    if (tab === 'clientes') {
      this.filteredMembresias = [...this.membresias];
    } else {
      this.filteredPlantillas = [...this.plantillas];
    }
  }

  filterMembresias(): void {
    if (!this.searchTerm.trim()) {
      if (this.activeTab === 'clientes') {
        this.filteredMembresias = [...this.membresias];
      } else {
        this.filteredPlantillas = [...this.plantillas];
      }
    } else {
      const term = this.searchTerm.toLowerCase();
      
      if (this.activeTab === 'clientes') {
        this.filteredMembresias = this.membresias.filter(membresia =>
          membresia.nombre?.toLowerCase().includes(term) ||
          membresia.tipoMem?.toLowerCase().includes(term) ||
          membresia.cliente_nombre?.toLowerCase().includes(term) ||
          membresia.cliente_email?.toLowerCase().includes(term) ||
          membresia.precio?.toString().includes(term)
        );
      } else {
        this.filteredPlantillas = this.plantillas.filter(plantilla =>
          plantilla.nombre?.toLowerCase().includes(term) ||
          plantilla.tipoMem?.toLowerCase().includes(term) ||
          plantilla.descripcion?.toLowerCase().includes(term) ||
          plantilla.precio?.toString().includes(term)
        );
      }
    }
  }

  addMembresia(): void {
    this._router.navigate(['/add-membresia']);
  }

  viewMembresia(id: number): void {
    this._router.navigate(['/show-membresia', id]);
  }

  editMembresia(id: number): void {
    this._router.navigate(['/update-membresia', id]);
  }

  editPlantilla(id: number): void {
    this._router.navigate(['/update-membresia', id]);
  }

  deleteMembresia(membresia: MembresiaResponse): void {
    // Validación más robusta del tipo usando la misma lógica que el resto del componente
    const esPlantilla = String(membresia.esPlantilla) === "1";
    const tipo = esPlantilla ? 'plantilla' : 'membresía';
    
    // Validación mejorada del nombre con fallbacks más descriptivos
    let nombre = '';
    if (membresia.nombre && membresia.nombre.trim() !== '') {
      nombre = membresia.nombre.trim();
    } else if (membresia.tipoMem && membresia.tipoMem.trim() !== '') {
      nombre = membresia.tipoMem.trim();
    } else {
      // Fallback si no hay nombre ni tipo disponible
      nombre = esPlantilla ? 'Plantilla sin nombre' : 'Membresía sin nombre';
    }
    
    // Agregar información adicional para mejor contexto
    let descripcionAdicional = '';
    if (!esPlantilla && membresia.cliente_nombre) {
      descripcionAdicional = ` (Cliente: ${membresia.cliente_nombre})`;
    } else if (esPlantilla && membresia.tipoMem) {
      descripcionAdicional = ` (Tipo: ${membresia.tipoMem})`;
    }
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la ${tipo} "${nombre}"${descripcionAdicional}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._membresiaService.deleteMembresia(parseInt(membresia.idMembresia)).subscribe({
          next: (response: any) => {
            this.showAlert('success', `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} "${nombre}" eliminada correctamente`);
            this.loadAllData();
          },
          error: (error: any) => {
            console.error(`Error al eliminar ${tipo}:`, error);
            this.showAlert('error', `Error al eliminar la ${tipo} "${nombre}"`);
          }
        });
      }
    });
  }

  // Funciones de utilidad para mostrar datos
  getEstadoTexto(membresia: MembresiaResponse): string {
    const estado = String(membresia.estado) === "1";
    
    // Usar la misma lógica para plantillas y membresías de cliente
    if (!estado) {
      return 'Inactiva';
    }
    
    // Si está activa en BD, verificar si está vencida por fecha (solo para membresías con fechas)
    if (this.isVencida(membresia)) {
      return 'Vencida';
    }
    return 'Activa';
  }

  getEstadoClase(membresia: MembresiaResponse): string {
    const estado = String(membresia.estado) === "1";
    
    // Usar la misma lógica para plantillas y membresías de cliente
    if (!estado) {
      return 'inactiva';
    }
    
    if (this.isVencida(membresia)) {
      return 'vencida';
    }
    if (this.vencePronto(membresia)) {
      return 'vence-pronto';
    }
    return 'activa';
  }

  getPrecioFormateado(precio: number | string): string {
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    return '₡' + Number(precioNum).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getPrecioFinal(membresia: MembresiaResponse): number {
    const precio = parseFloat(membresia.precio);
    const descuento = parseFloat(membresia.descuento || "0");
    
    if (descuento > 0) {
      return precio * (1 - descuento / 100);
    }
    return precio;
  }

  isVencida(membresia: MembresiaResponse): boolean {
    if (!membresia.fechaVenc || String(membresia.esPlantilla) === "1") return false;
    return new Date(membresia.fechaVenc) < new Date();
  }

  vencePronto(membresia: MembresiaResponse): boolean {
    if (!membresia.fechaVenc || String(membresia.esPlantilla) === "1") return false;
    const hoy = new Date();
    const vencimiento = new Date(membresia.fechaVenc);
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes > 0;
  }

  // Métodos helper para template
  parseFloat(value: string): number {
    return parseFloat(value || "0");
  }

  parseInt(value: string): number {
    return parseInt(value || "0");
  }

  hasDescuento(membresia: MembresiaResponse): boolean {
    return !!(membresia.descuento && parseFloat(membresia.descuento) > 0);
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