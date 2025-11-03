import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InscripcionClaseService } from '../../services/inscripcionClase.service';
import { InscripcionClase } from '../../models/inscripcionClase';
import Swal from 'sweetalert2';

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

  constructor(
    private _inscripcionService: InscripcionClaseService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadInscripciones();
  }

  loadInscripciones(): void {
    this.isLoading = true;
    this._inscripcionService.getInscripciones().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.inscripciones = response.data.map((inscripcionData: any) => 
            this._inscripcionService.mapResponseToModel(inscripcionData)
          );
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