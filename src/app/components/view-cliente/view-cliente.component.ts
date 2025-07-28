import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-cliente',
  templateUrl: './view-cliente.component.html',
  styleUrls: ['./view-cliente.component.css']
})
export class ViewClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  filter: string = '';

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: res => {
        if (res.status === 200) {
          this.clientes = res.data;
        } else {
          console.error('Error cargando clientes', res);
        }
      },
      error: err => console.error('Error cargando clientes', err)
    });
  }

  deleteCliente(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar cliente con ID ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.deleteCliente(id).subscribe({
          next: res => {
            Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success');
            this.loadClientes();
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
            console.error('Error al eliminar cliente', err);
          }
        });
      }
    });
  }

  showCliente(id: number): void {
    this.router.navigate(['/show-cliente', id]);
  }

  get filteredClientes(): Cliente[] {
    if (!this.filter) return this.clientes;
    const term = this.filter.toLowerCase();
    return this.clientes.filter(c =>
      c.idCliente.toString().includes(term) ||
      c.nombre.toLowerCase().includes(term) ||
      c.apellido.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }
}
