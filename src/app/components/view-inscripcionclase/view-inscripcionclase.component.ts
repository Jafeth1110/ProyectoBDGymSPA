import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InscripcionClaseService } from '../../services/inscripcionClase.service';
import { InscripcionClase } from '../../models/inscripcionClase';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-inscripcionclase',
  templateUrl: './view-inscripcionclase.component.html',
  styleUrls: ['./view-inscripcionclase.component.css']
})
export class ViewInscripcionclaseComponent implements OnInit {
  public inscripciones: InscripcionClase[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';
  public filteredInscripciones: InscripcionClase[] = [];
  public isClient: boolean = false;
  public isTrainer: boolean = false;
  private currentClienteId: number | null = null;
  private currentUserEmail: string | null = null;
  private currentEntrenadorId: number | null = null;
  private currentUserId: number | null = null; // sub del identity (idUsuario)

  constructor(
    private _inscripcionService: InscripcionClaseService,
    private _router: Router,
    private auth: AuthService
  ) {}

  private async resolveEntrenadorId(): Promise<void> {
    if (this.isTrainer && !this.currentEntrenadorId && this.currentUserEmail) {
      // Cargar la lista completa de inscripciones y extraer entrenadores únicos
      // Luego buscar cuál coincide con el email actual
      console.log('Intentando resolver ID de entrenador por email...');
    }
  }

  ngOnInit(): void {
    this.isClient = this.auth.getCurrentUserRole() === 'cliente';
    this.isTrainer = this.auth.getCurrentUserRole() === 'entrenador';
    this.currentClienteId = this.auth.getCurrentClienteId();
    this.currentUserEmail = this.auth.getCurrentUserEmail()?.toLowerCase() || null;
    this.currentEntrenadorId = this.auth.getCurrentEntrenadorId();
    this.currentUserId = this.auth.getCurrentUserSub(); // Obtener sub del identity (idUsuario)
    
    // Si es entrenador pero no tenemos el ID, intentar obtenerlo de la lista completa
    if (this.isTrainer && !this.currentEntrenadorId) {
      console.log('Entrenador sin ID directo. Sub (idUsuario):', this.currentUserId, 'Email:', this.currentUserEmail);
    }
    
    this.loadInscripciones();
  }

  loadInscripciones(): void {
    this.isLoading = true;
    this._inscripcionService.getInscripciones().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const mapped = response.data.map((inscripcionData: any) => 
            this._inscripcionService.mapResponseToModel(inscripcionData)
          );
          
          console.log('Inscripciones mapeadas:', mapped.length);
          console.log('Primera inscripción (sample):', mapped[0]);
          
          if (this.isClient) {
            // Filtro por idCliente si lo conocemos; si no, por email del cliente en la inscripción
            if (this.currentClienteId) {
              this.inscripciones = mapped.filter((i: InscripcionClase) => i.idCliente === this.currentClienteId);
            } else if (this.currentUserEmail) {
              this.inscripciones = mapped.filter((i: InscripcionClase) =>
                (i.cliente?.email || '').toLowerCase() === this.currentUserEmail
              );
            } else {
              this.inscripciones = [];
            }
          } else if (this.isTrainer) {
            // Filtro por idEntrenador para entrenadores
            if (this.currentEntrenadorId) {
              console.log('Filtrando por entrenador ID directo:', this.currentEntrenadorId);
              this.inscripciones = mapped.filter((i: InscripcionClase) => 
                Number(i.idEntrenador) === Number(this.currentEntrenadorId)
              );
            } else if (this.currentUserId) {
              // Buscar por idUsuario (sub del identity) en los datos del entrenador de las inscripciones
              console.log('🔍 Buscando idEntrenador por idUsuario (sub del JWT):', this.currentUserId);
              const rawData = response.data;
              
              // Log de todos los entrenadores únicos en las inscripciones
              const entrenadoresUnicos = new Map<number, any>();
              rawData.forEach((item: any) => {
                if (item.entrenador && item.idEntrenador) {
                  if (!entrenadoresUnicos.has(item.idEntrenador)) {
                    entrenadoresUnicos.set(item.idEntrenador, item.entrenador);
                  }
                }
              });
              
              console.log('📋 Entrenadores únicos encontrados en inscripciones:');
              entrenadoresUnicos.forEach((entrenador, id) => {
                console.log(`  - idEntrenador: ${id}, idUsuario: ${entrenador.idUsuario || 'N/A'}, nombre: ${entrenador.nombre || 'N/A'}`);
              });
              
              // Log detallado del primer item raw para ver estructura completa
              if (rawData.length > 0) {
                console.log('🔍 Estructura completa del primer item raw:', JSON.stringify(rawData[0], null, 2));
              }
              
              let foundEntrenadorId: number | null = null;
              
              // Buscar coincidencia por idUsuario en los datos RAW del backend
              for (const item of rawData) {
                // Buscar directamente en el objeto raw (campos planos del backend)
                const entrenadorIdUsuario = item.entrenador_idUsuario || 
                                           item.entrenador?.idUsuario || 
                                           item.entrenador?.idUser;
                
                console.log(`  🔎 Revisando item: idEntrenador=${item.idEntrenador}, entrenador_idUsuario=${entrenadorIdUsuario}`);
                
                if (entrenadorIdUsuario && Number(entrenadorIdUsuario) === Number(this.currentUserId)) {
                  foundEntrenadorId = item.idEntrenador;
                  console.log('✅ ¡ENCONTRADO! idEntrenador:', foundEntrenadorId, 'tiene idUsuario:', entrenadorIdUsuario);
                  console.log('   Coincide con el sub del JWT:', this.currentUserId);
                  break;
                }
              }
              
              if (foundEntrenadorId) {
                this.currentEntrenadorId = foundEntrenadorId;
                this.inscripciones = mapped.filter((i: InscripcionClase) => 
                  Number(i.idEntrenador) === Number(foundEntrenadorId)
                );
                console.log('✅ Inscripciones filtradas para entrenador ID', foundEntrenadorId + ':', this.inscripciones.length);
              } else {
                console.warn('⚠️ No se encontró inscripciones con entrenador idUsuario:', this.currentUserId);
                console.log('🔄 El entrenador no tiene inscripciones asignadas aún.');
                
                // Si no hay inscripciones con este idUsuario, mostrar lista vacía
                // (El entrenador existe pero no tiene inscripciones todavía)
                this.inscripciones = [];
              }
            } else {
              console.warn('Entrenador sin ID, ni sub, ni email');
              this.inscripciones = [];
            }
          } else {
            this.inscripciones = mapped;
          }
          this.filteredInscripciones = [...this.inscripciones];
        } else {
          this.inscripciones = [];
          this.filteredInscripciones = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar inscripciones:', error);
        this.showAlert('error', 'Error al cargar las inscripciones');
        this.isLoading = false;
      }
    });
  }

  filterInscripciones(): void {
    if (!this.searchTerm.trim()) {
      this.filteredInscripciones = [...this.inscripciones];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredInscripciones = this.inscripciones.filter(inscripcion =>
        inscripcion.getNombreCliente()?.toLowerCase().includes(term) ||
        (inscripcion.entrenador 
          ? (inscripcion.entrenador.nombre + ' ' + inscripcion.entrenador.apellido).toLowerCase().includes(term)
          : false) ||
        (inscripcion.clase?.nombre || '').toLowerCase().includes(term)
      );
    }
  }

  addInscripcion(): void {
    this._router.navigate(['/add-inscripcionclase']);
  }

  viewInscripcion(id: number): void {
    this._router.navigate(['/show-inscripcionclase', id]);
  }

  editInscripcion(id: number): void {
    this._router.navigate(['/update-inscripcionclase', id]);
  }

  deleteInscripcion(inscripcion: InscripcionClase): void {
    const clienteNombre = inscripcion.getNombreCliente() || 'Cliente desconocido';
    const claseNombre = inscripcion.clase?.nombre || 'Clase desconocida';
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la inscripción de "${clienteNombre}" a "${claseNombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._inscripcionService.deleteInscripcion(inscripcion.idInscripcionClase).subscribe({
          next: (response: any) => {
            const message = response?.message || 'Inscripción eliminada correctamente';
            this.showAlert('success', message);
            this.loadInscripciones();
          },
          error: (error: any) => {
            console.error('Error al eliminar inscripción:', error);
            const msg = error?.error?.message || 'Error al eliminar la inscripción';
            this.showAlert('error', msg);
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