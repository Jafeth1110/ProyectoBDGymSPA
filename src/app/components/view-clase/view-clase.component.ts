import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { Clase } from '../../models/clase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-clase',
  templateUrl: './view-clase.component.html',
  styleUrls: ['./view-clase.component.css']
})
export class ViewClaseComponent implements OnInit {
  public clases: Clase[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';
  public filteredClases: Clase[] = [];

  constructor(
    private _claseService: ClaseService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadClases();
  }

  loadClases(): void {
    this.isLoading = true;
    this._claseService.getClases().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.clases = response.data.map((claseData: any) => 
            this._claseService.mapResponseToModel(claseData)
          );
          this.filteredClases = [...this.clases];
        } else {
          this.clases = [];
          this.filteredClases = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar clases:', error);
        this.showAlert('error', 'Error al cargar las clases');
        this.isLoading = false;
      }
    });
  }

  filterClases(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClases = [...this.clases];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClases = this.clases.filter(clase =>
        clase.nombre.toLowerCase().includes(term) ||
        clase.descripcion.toLowerCase().includes(term) ||
        clase.getNombreEntrenador()?.toLowerCase().includes(term)
      );
    }
  }

  addClase(): void {
    this._router.navigate(['/add-clase']);
  }

  viewClase(id: number): void {
    this._router.navigate(['/show-clase', id]);
  }

  editClase(id: number): void {
    this._router.navigate(['/update-clase', id]);
  }

  deleteClase(clase: Clase): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la clase "${clase.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._claseService.deleteClase(clase.idClase).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Clase eliminada correctamente');
            this.loadClases(); // Recargar la lista
          },
          error: (error: any) => {
            console.error('Error al eliminar clase:', error);
            this.showAlert('error', 'Error al eliminar la clase');
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