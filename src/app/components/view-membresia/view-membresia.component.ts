import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import { MembresiaResponse } from '../../models/api-interfaces';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';

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
  public isClient: boolean = false;
  private currentClienteId: number | null = null;
  private currentUserEmail: string | null = null;

  constructor(
    private _membresiaService: MembresiaService,
    private _router: Router,
    private auth: AuthService,
    private _clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.isClient = this.auth.getCurrentUserRole() === 'cliente';
    this.currentClienteId = this.auth.getCurrentClienteId();
    this.currentUserEmail = this.auth.getCurrentUserEmail();
    
    console.log('Cliente info:', { isClient: this.isClient, email: this.currentUserEmail, idCliente: this.currentClienteId });
    
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.isLoadingPlantillas = true;
    
    // SIEMPRE traer todas las membresías, filtraremos en el frontend
    this._membresiaService.getMembresias().subscribe({
      next: (response: any) => {
        console.log('Respuesta de membresías:', response);
        
        if (response && response.data) {
          // Filtrar membresías de clientes: las que NO son plantillas y tienen idCliente
          let membresiasFiltradas = response.data.filter((m: any) => {
            const esPlantilla = String(m.esPlantilla) === "1";
            return !esPlantilla && m.idCliente !== null && m.idCliente !== undefined && m.idCliente !== '';
          });
          
          // Si es cliente, filtrar por email del usuario actual
          if (this.isClient && this.currentUserEmail) {
            console.log('Filtrando membresías para cliente con email:', this.currentUserEmail);
            membresiasFiltradas = membresiasFiltradas.filter((m: any) => {
              const emailMembresia = m.cliente_email?.toLowerCase() || m.email?.toLowerCase();
              const match = emailMembresia === this.currentUserEmail?.toLowerCase();
              console.log('Comparando:', emailMembresia, 'con', this.currentUserEmail, '=', match);
              return match;
            });
            console.log('Membresías filtradas para cliente:', membresiasFiltradas);
          }
          
          this.membresias = membresiasFiltradas;
          
          // Filtrar plantillas: las que SÍ son plantillas (SIEMPRE se muestran)
          this.plantillas = response.data.filter((m: any) => {
            const esPlantilla = String(m.esPlantilla) === "1";
            return esPlantilla;
          });
          
          console.log('Plantillas encontradas:', this.plantillas.length);
          
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
    if (this.isClient) { return; }
    this._router.navigate(['/update-membresia', id]);
  }

  editPlantilla(id: number): void {
    if (this.isClient) { return; }
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
        const idMembresia = Number(membresia.idMembresia);
        
        this._membresiaService.deleteMembresia(idMembresia).subscribe({
          next: (response: any) => {
            // Verificar códigos de éxito del backend
            if (response && (
              response.status === 200 || 
              response.codigo === 0 ||
              response.code === 0 ||
              (response.message && (
                response.message.toLowerCase().includes('eliminad') ||
                response.message.toLowerCase().includes('correcta') ||
                response.message.toLowerCase().includes('éxito')
              ))
            )) {
              this.showAlert('success', `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} "${nombre}" eliminada correctamente`);
              this.loadAllData();
            } else {
              // El servidor respondió pero con un error
              const errorMsg = response?.message || response?.mensaje || `No se pudo eliminar la ${tipo}`;
              this.showAlert('error', errorMsg);
            }
          },
          error: (error: any) => {
            console.error(`Error al eliminar ${tipo}:`, error);
            const errorMsg = error?.error?.message || error?.message || `Error al eliminar la ${tipo} "${nombre}"`;
            this.showAlert('error', errorMsg);
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

  // Métodos para estado de pago
  getEstadoPago(membresia: MembresiaResponse): string {
    // Si es plantilla, no aplica
    if (String(membresia.esPlantilla) === "1") {
      return 'No aplica';
    }
    
    // Si viene del backend el campo estado_pago
    if (membresia.estado_pago) {
      return membresia.estado_pago;
    }
    
    // Calcular basado en el campo pagada
    if (this.isPagada(membresia)) {
      return 'Pagada';
    }
    
    return 'Pendiente de pago';
  }

  getEstadoPagoClase(membresia: MembresiaResponse): string {
    const estado = this.getEstadoPago(membresia);
    
    switch (estado) {
      case 'Pagada':
        return 'pago-success';
      case 'Pendiente de pago':
        return 'pago-warning';
      case 'No aplica':
        return 'pago-secondary';
      default:
        return 'pago-info';
    }
  }

  isPagada(membresia: MembresiaResponse): boolean {
    return membresia.pagada === true || 
           (membresia.pagada as any) === 1 || 
           (membresia.pagada as any) === '1';
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