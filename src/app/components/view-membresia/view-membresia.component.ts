import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-membresia',
  templateUrl: './view-membresia.component.html',
  styleUrls: ['./view-membresia.component.css']
})
export class ViewMembresiaComponent implements OnInit {
  public membresias: Membresia[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';
  public filteredMembresias: Membresia[] = [];

  constructor(
    private _membresiaService: MembresiaService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadMembresias();
  }

  loadMembresias(): void {
    this.isLoading = true;
    this._membresiaService.getMembresias().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.membresias = response.data.map((membresiaData: any) => 
            this._membresiaService.mapResponseToModel(membresiaData)
          );
          this.filteredMembresias = [...this.membresias];
        } else {
          this.membresias = [];
          this.filteredMembresias = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar membresías:', error);
        this.showAlert('error', 'Error al cargar las membresías');
        this.isLoading = false;
      }
    });
  }

  filterMembresias(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMembresias = [...this.membresias];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredMembresias = this.membresias.filter(membresia =>
        membresia.tipo.toLowerCase().includes(term) ||
        membresia.descripcion.toLowerCase().includes(term) ||
        membresia.getEstadoTexto().toLowerCase().includes(term)
      );
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

  deleteMembresia(membresia: Membresia): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la membresía "${membresia.tipo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._membresiaService.deleteMembresia(membresia.idMembresia).subscribe({
          next: (response: any) => {
            this.showAlert('success', 'Membresía eliminada correctamente');
            this.loadMembresias();
          },
          error: (error: any) => {
            console.error('Error al eliminar membresía:', error);
            this.showAlert('error', 'Error al eliminar la membresía');
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