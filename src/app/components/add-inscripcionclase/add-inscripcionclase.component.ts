import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InscripcionClaseService } from '../../services/inscripcionClase.service';
import { ClienteService } from '../../services/cliente.service';
import { ClaseService } from '../../services/clase.service';
import { EntrenadorService } from '../../services/entrenador.service';
import { InscripcionClase } from '../../models/inscripcionClase';
import { InscripcionClaseFormData } from '../../models/api-interfaces';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inscripcionclase',
  templateUrl: './add-inscripcionclase.component.html',
  styleUrls: ['./add-inscripcionclase.component.css']
})
export class AddInscripcionClaseComponent implements OnInit {
  public inscripcion: InscripcionClase = new InscripcionClase();
  public clientes: any[] = [];
  public entrenadores: any[] = [];
  public clases: any[] = [];
  public validationErrors: string[] = [];
  public isLoading: boolean = false;
  public isClient: boolean = false;
  public currentClienteNombre: string = '';
  public isTrainer: boolean = false;
  public currentEntrenadorNombre: string = '';

  constructor(
    private _inscripcionService: InscripcionClaseService,
    private _clienteService: ClienteService,
    private _entrenadorService: EntrenadorService,
    private _claseService: ClaseService,
    private _router: Router,
    private auth: AuthService
  ) {
    this.resetInscripcion();
  }

  ngOnInit(): void {
    this.isClient = this.auth.getCurrentUserRole() === 'cliente';
    this.isTrainer = this.auth.getCurrentUserRole() === 'entrenador';
    if (this.isClient) {
      const idCliente = this.auth.getCurrentClienteId();
      if (idCliente) {
        this.inscripcion.idCliente = idCliente;
        // Mostrar el nombre del cliente en UI si existe
        const identity = this.auth.getCurrentUser();
        if (identity?.nombre || identity?.apellido) {
          this.currentClienteNombre = `${identity?.nombre || ''} ${identity?.apellido || ''}`.trim();
        } else if (identity?.cliente?.user) {
          const u = identity.cliente.user;
          this.currentClienteNombre = `${u?.nombre || ''} ${u?.apellido || ''}`.trim();
        }
      } else {
        // Fallback: buscar su idCliente por email en la lista de clientes
        const email = this.auth.getCurrentUserEmail()?.toLowerCase();
        if (email) {
          this._clienteService.getClientes().subscribe({
            next: (resp: any) => {
              const lista = resp?.data || resp || [];
              const match = (lista as any[]).find(c => (c.email || c?.user?.email || '').toLowerCase() === email);
              if (match) {
                this.inscripcion.idCliente = match.idCliente || match?.cliente?.idCliente || 0;
                this.currentClienteNombre = `${match?.nombre || match?.user?.nombre || ''} ${match?.apellido || match?.user?.apellido || ''}`.trim();
              }
            },
            error: () => {}
          });
        }
      }
    } else {
      this.loadClientes();
    }
    // Si es entrenador, fijar su idEntrenador y nombre (similar al cliente)
    if (this.isTrainer) {
      const idEnt = this.auth.getCurrentEntrenadorId();
      if (idEnt) {
        this.inscripcion.idEntrenador = idEnt;
        const identity = this.auth.getCurrentUser();
        if (identity?.nombre || identity?.apellido) {
          this.currentEntrenadorNombre = `${identity?.nombre || ''} ${identity?.apellido || ''}`.trim();
        } else if (identity?.entrenador?.user) {
          const u = identity.entrenador.user;
          this.currentEntrenadorNombre = `${u?.nombre || ''} ${u?.apellido || ''}`.trim();
        }
      } else {
        // Fallback: buscar su idEntrenador por email
        const email = this.auth.getCurrentUserEmail()?.toLowerCase();
        if (email) {
          this._entrenadorService.getEntrenadores().subscribe({
            next: (resp: any) => {
              const lista = resp?.data || resp || [];
              const match = (lista as any[]).find(e => (e.email || e?.user?.email || '').toLowerCase() === email);
              if (match) {
                this.inscripcion.idEntrenador = match.idEntrenador || match?.entrenador?.idEntrenador || 0;
                this.currentEntrenadorNombre = `${match?.user?.nombre || match?.nombre || ''} ${match?.user?.apellido || match?.apellido || ''}`.trim();
              }
            },
            error: () => {}
          });
        }
      }
    }
    this.loadEntrenadores();
    this.loadClases();
  }

  resetInscripcion() {
    this.inscripcion = new InscripcionClase(0, 0, 0, 0, new Date().toISOString().split('T')[0]);
  }

  loadClientes(): void {
    this._clienteService.getClientes().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clientes = (response.data as any[]).map(this.normalizeCliente);
        } else if (Array.isArray(response)) {
          this.clientes = (response as any[]).map(this.normalizeCliente);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.showAlert('error', 'Error al cargar la lista de clientes');
      }
    });
  }

  loadEntrenadores(): void {
    this._entrenadorService.getEntrenadores().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.entrenadores = (response.data as any[]).map(this.normalizeEntrenador);
        } else if (Array.isArray(response)) {
          this.entrenadores = (response as any[]).map(this.normalizeEntrenador);
        }
        // Si es entrenador y aún no está seteado el id, intentar por email en la lista cargada
        if (this.isTrainer && (!this.inscripcion.idEntrenador || this.inscripcion.idEntrenador === 0)) {
          const email = this.auth.getCurrentUserEmail()?.toLowerCase();
          if (email) {
            const match = this.entrenadores.find(e => (e?.user?.email || '').toLowerCase() === email || (e.email || '').toLowerCase() === email);
            if (match) {
              this.inscripcion.idEntrenador = match.idEntrenador;
              this.currentEntrenadorNombre = `${match?.user?.nombre || match?.nombre || ''} ${match?.user?.apellido || match?.apellido || ''}`.trim();
            }
          }
        }
        // Fallback: si no hay entrenadores por error backend, intentar derivarlos desde clases
        if (!this.entrenadores || this.entrenadores.length === 0) {
          this.fallbackLoadEntrenadoresFromClases();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar entrenadores:', error);
        this.showAlert('error', 'Error al cargar la lista de entrenadores');
        // Fallback también cuando hay error explícito
        this.fallbackLoadEntrenadoresFromClases();
      }
    });
  }

  private fallbackLoadEntrenadoresFromClases(): void {
    this._claseService.getClases().subscribe({
      next: (resp: any) => {
        const lista = (resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        // Buscar info de entrenador en cada clase
        const mapa = new Map<number, any>();
        (lista as any[]).forEach((c: any) => {
          // Formatos soportados: clase.entrenador { idEntrenador, nombre, apellido } o campos aplanados
          if (c?.entrenador?.idEntrenador) {
            const id = c.entrenador.idEntrenador;
            if (!mapa.has(id)) {
              mapa.set(id, {
                idEntrenador: id,
                user: {
                  nombre: c.entrenador.nombre ?? '',
                  apellido: c.entrenador.apellido ?? ''
                }
              });
            }
          } else if (c?.idEntrenador) {
            const id = c.idEntrenador;
            if (!mapa.has(id)) {
              mapa.set(id, {
                idEntrenador: id,
                user: {
                  nombre: c.entrenador_nombre ?? c.nombreEntrenador ?? '',
                  apellido: c.entrenador_apellido ?? c.apellidoEntrenador ?? ''
                }
              });
            }
          }
        });
        const arr = Array.from(mapa.values());
        if (arr.length > 0) {
          console.info('Entrenadores derivados desde clases (fallback).');
          this.entrenadores = arr;
        }
      },
      error: (e) => {
        console.warn('Fallback desde clases también falló:', e);
      }
    });
  }

  loadClases(): void {
    this._claseService.getClases().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clases = response.data;
        } else if (Array.isArray(response)) {
          this.clases = response;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clases:', error);
        this.showAlert('error', 'Error al cargar la lista de clases');
      }
    });
  }

  private normalizeCliente = (item: any) => {
    // Si ya trae user, devolver tal cual
    if (item && item.user && (item.user.nombre || item.user.apellido || item.user.email)) {
      return item;
    }
    // Si trae campos en la raíz
    if (item && (item.nombre || item.apellido || item.email)) {
      return {
        ...item,
        user: {
          nombre: item.nombre ?? item.cliente_nombre ?? '',
          apellido: item.apellido ?? item.cliente_apellido ?? '',
          email: item.email ?? item.cliente_email ?? ''
        }
      };
    }
    // Si trae campos aplanados con prefijo cliente_
    return {
      ...item,
      user: {
        nombre: item?.cliente_nombre ?? '',
        apellido: item?.cliente_apellido ?? '',
        email: item?.cliente_email ?? ''
      }
    };
  };

  private normalizeEntrenador = (item: any) => {
    if (item && item.user && (item.user.nombre || item.user.apellido)) {
      return item;
    }
    if (item && (item.nombre || item.apellido)) {
      return {
        ...item,
        user: {
          nombre: item.nombre ?? item.entrenador_nombre ?? '',
          apellido: item.apellido ?? item.entrenador_apellido ?? ''
        }
      };
    }
    return {
      ...item,
      user: {
        nombre: item?.entrenador_nombre ?? '',
        apellido: item?.entrenador_apellido ?? ''
      }
    };
  };

  onSubmit(form?: any): void {
    this.validationErrors = [];

    if (!this.inscripcion.idCliente || !this.inscripcion.idEntrenador || !this.inscripcion.idClase || !this.inscripcion.fechaInscripcion) {
      this.showAlert('error', 'Debes completar todos los campos antes de enviar.');
      return;
    }

    this.isLoading = true;

    const inscripcionData: InscripcionClaseFormData = {
      idCliente: this.inscripcion.idCliente,
      idEntrenador: this.inscripcion.idEntrenador,
      idClase: this.inscripcion.idClase,
      fechaInscripcion: this.inscripcion.fechaInscripcion
    };

    this._inscripcionService.addInscripcion(inscripcionData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 201 || response.status === 200 || response.code === 200)) {
          this.showAlert('success', 'Inscripción creada correctamente', () => {
            this._router.navigate(['/view-inscripcionclase']);
          });
        } else {
          this.showAlert('error', response?.message || 'Error al crear la inscripción');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear inscripción:', error);
        this.handleErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  private handleErrorResponse(error: any): void {
    if (error.error && error.error.errors) {
      const errors = error.error.errors;
      this.validationErrors = [];
      
      for (const field in errors) {
        if (Array.isArray(errors[field])) {
          this.validationErrors.push(...errors[field]);
        } else {
          this.validationErrors.push(errors[field]);
        }
      }
      
      this.showAlert('error', 'Errores de validación: ' + this.validationErrors.join(', '));
    } else if (error.error && error.error.message) {
      this.showAlert('error', error.error.message);
    } else if (error.message) {
      this.showAlert('error', error.message);
    } else {
      this.showAlert('error', 'Error inesperado al crear la inscripción. Inténtalo de nuevo.');
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

  goBack(): void {
    this._router.navigate(['/view-inscripcionclase']);
  }
}
