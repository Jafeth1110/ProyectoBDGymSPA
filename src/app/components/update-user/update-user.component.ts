import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TelefonoService } from '../../services/telefono.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
  providers: [UserService]
})
export class UpdateUserComponent implements OnInit {
  public user: User;
  public validationErrors: string[] = [];
  public telefonosParaEliminar: number[] = []; // IDs de teléfonos marcados para eliminación

  constructor(
    private _userService: UserService,
    private _telefonoService: TelefonoService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    // Inicializa el usuario vacío
    this.user = new User(0, '', '', '', '', '', 'cliente');
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.loadUser(email);
      }
    });
  }

  loadUser(email: string): void {
    // Limpiar las marcas de eliminación al cargar un usuario
    this.telefonosParaEliminar = [];
    
    this._userService.showUser(email).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
        // CAMBIO: verificar tanto response.user como response.data por compatibilidad
        if (response?.user || response?.data) {
          const u = response.user || response.data;
          console.log('Datos del usuario para editar:', u);
          console.log('Rol del backend:', u.rol, typeof u.rol);
          
          // Manejar el rol correctamente
          let rolString = '';
          if (typeof u.rol === 'string') {
            rolString = u.rol;
          } else if (u.rol && u.rol.nombreRol) {
            rolString = u.rol.nombreRol;
          } else if (u.idRol) {
            // Fallback basado en idRol
            switch (u.idRol) {
              case 1: rolString = 'admin'; break;
              case 2: rolString = 'cliente'; break;
              case 3: rolString = 'entrenador'; break;
              default: rolString = 'cliente';
            }
          }
          
          // Procesar teléfonos - verificar diferentes propiedades posibles
          const telefonos = u.telefonos || u.telefonos_list || [];
          
          this.user = new User(
            u.idUsuario,
            u.nombre,
            u.apellido,
            u.cedula,
            u.email,
            '', // No traigas la contraseña
            rolString, // Usar el rol procesado
            u.idRol,
            telefonos
          );
          
          console.log('Usuario cargado para editar:', this.user);
          console.log('Teléfonos del usuario:', this.user.telefonos);
          // Verificar los tipos de teléfono específicamente
          this.user.telefonos.forEach((tel, index) => {
            console.log(`Teléfono ${index}: tipo="${tel.tipoTel}", numero="${tel.telefono}"`);
          });
        } else {
          this.showAlert('error', 'Usuario no encontrado');
          this._router.navigate(['/view-users']);
        }
      },
      error => {
        console.error('Error al obtener usuario:', error);
        this.showAlert('error', 'Error al obtener los datos del usuario');
        this._router.navigate(['/view-users']);
      }
    );
  }

  // Métodos para manejar teléfonos
  addTelefono(): void {
    this.user.addTelefono('celular', ''); // Establecer celular como tipo por defecto
  }

  removeTelefono(index: number): void {
    const telefono = this.user.telefonos[index];
    
    if (!telefono) return;

    // Si el teléfono ya está marcado para eliminación, desmarcarlo
    if (telefono.idTelefono && this.telefonosParaEliminar.includes(telefono.idTelefono)) {
      this.telefonosParaEliminar = this.telefonosParaEliminar.filter(id => id !== telefono.idTelefono);
      return;
    }

    // Si es un teléfono nuevo (sin ID), eliminarlo inmediatamente
    if (!telefono.idTelefono) {
      this.user.removeTelefono(index);
      return;
    }

    // Para teléfonos existentes, mostrar confirmación y marcar para eliminación
    Swal.fire({
      title: '¿Eliminar teléfono?',
      text: `¿Estás seguro de que deseas eliminar el teléfono ${telefono.telefono} (${telefono.tipoTel})? El teléfono será eliminado cuando guardes los cambios.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, marcar para eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && telefono.idTelefono) {
        // Marcar para eliminación
        this.telefonosParaEliminar.push(telefono.idTelefono);
        Swal.fire({
          title: 'Marcado para eliminación',
          text: 'El teléfono será eliminado cuando guardes los cambios.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Verifica si un teléfono está marcado para eliminación
   */
  isTelefonoMarcadoParaEliminacion(telefono: any): boolean {
    return telefono.idTelefono && this.telefonosParaEliminar.includes(telefono.idTelefono);
  }

  updateUser(form?: any): void {
    this.validationErrors = [];
    
    // Validar campos requeridos
    if (
      !this.user.nombre ||
      !this.user.apellido ||
      !this.user.cedula ||
      !this.user.email ||
      !this.user.rol
    ) {
      this.showAlert('error', 'Debes completar todos los campos obligatorios antes de enviar.');
      return;
    }

    // Validar formato de nombre y apellido (solo letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(this.user.nombre)) {
      this.showAlert('error', 'El nombre solo puede contener letras y espacios.');
      return;
    }
    
    if (!nameRegex.test(this.user.apellido)) {
      this.showAlert('error', 'El apellido solo puede contener letras y espacios.');
      return;
    }

    // Validar cédula (8-12 dígitos)
    const cedulaRegex = /^\d{8,12}$/;
    if (!cedulaRegex.test(this.user.cedula)) {
      this.showAlert('error', 'La cédula debe tener entre 8 y 12 dígitos.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.showAlert('error', 'El formato del correo electrónico no es válido.');
      return;
    }

    // Validar contraseña si se proporciona (mínimo 6 caracteres alfanuméricos)
    if (this.user.password && this.user.password.trim() !== '') {
      const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
      if (!passwordRegex.test(this.user.password)) {
        this.showAlert('error', 'La contraseña debe tener mínimo 6 caracteres alfanuméricos.');
        return;
      }
    }

    // Validar teléfonos (si existen)
    const telefonosValidos = this.user.getValidTelefonos();
    const telefonoRegex = /^\d{8,12}$/;
    
    for (let telefono of telefonosValidos) {
      if (!telefono.tipoTel) {
        this.showAlert('error', 'Todos los teléfonos deben tener un tipo seleccionado.');
        return;
      }
      
      if (!telefonoRegex.test(telefono.telefono)) {
        this.showAlert('error', 'Los teléfonos deben tener entre 8 y 12 dígitos.');
        return;
      }
      
      if (!['celular', 'casa', 'trabajo'].includes(telefono.tipoTel)) {
        this.showAlert('error', 'El tipo de teléfono debe ser: celular, casa o trabajo.');
        return;
      }
    }

    // Preparar los datos para enviar según el formato correcto del backend
    const dataToSend: any = {
      nombre: this.user.nombre.trim(),
      apellido: this.user.apellido.trim(),
      cedula: this.user.cedula.trim(),
      email: this.user.email.toLowerCase().trim(),
      idRol: this.user.idRol || this.user.getIdRol()
    };
    
    // Agregar password solo si se proporciona
    if (this.user.password && this.user.password.trim() !== '') {
      dataToSend.password = this.user.password.trim();
    }
    
    // NO incluir teléfonos en la actualización del usuario
    // Los actualizaremos por separado usando el servicio de teléfonos
    
    console.log('Datos a actualizar (sin teléfonos):', dataToSend);
    console.log('Teléfonos válidos a actualizar por separado:', telefonosValidos);

    // ✅ CORRECTO - El backend espera los datos en un objeto 'data'
    const payload = { data: dataToSend };
    
    this._userService.updateUser(this.user.email, payload).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        // Manejar diferentes estructuras de respuesta del backend
        if (response.status === 200 || response.status === 201) {
          console.log('Usuario actualizado exitosamente, ahora actualizando teléfonos...');
          
          // Actualizar teléfonos por separado usando el servicio de teléfonos
          this.updateTelefonosSeparately(telefonosValidos);
        } else {
          this.showAlert('error', response.message || 'No se pudo actualizar el usuario');
        }
      },
      error: (error: any) => {
        console.error('Error completo al actualizar:', error);
        console.error('Status del error:', error.status);
        console.error('Mensaje del error:', error.error);
        
        if (error.status === 400 && error.error && error.error.message) {
          this.showAlert('error', error.error.message);
        } else if (error.status === 422) {
          // Manejar errores de validación
          if (error.error && error.error.errors) {
            const errors: string[] = [];
            if (Array.isArray(error.error.errors)) {
              errors.push(...error.error.errors);
            } else {
              Object.keys(error.error.errors).forEach(field => {
                const fieldErrors: string[] = error.error.errors[field];
                fieldErrors.forEach(msg => errors.push(msg));
              });
            }
            this.validationErrors = errors;
            this.showAlert('error', errors.join('<br>'));
          } else if (error.message) {
            this.showAlert('error', error.message);
          } else {
            this.showAlert('error', 'Error de validación en los datos enviados');
          }
        } else if (error.status === 500) {
          this.showAlert('error', 'Error interno del servidor. Por favor, revisa los logs del backend.');
        } else {
          this.showAlert('error', error.error?.message || error.message || 'Error inesperado del servidor.');
        }
      }
    });
  }

  showAlert(type: 'success' | 'error', message: string) {
    Swal.fire({
      title: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false
    });
  }

  cancel(): void {
    this._router.navigate(['/view-users']);
  }

  /**
   * Actualiza los teléfonos del usuario por separado usando el servicio de teléfonos
   */
  updateTelefonosSeparately(telefonosValidos: any[]): void {
    const updateObservables: any[] = [];

    // 1. Procesar eliminaciones
    if (this.telefonosParaEliminar.length > 0) {
      console.log('Eliminando teléfonos marcados:', this.telefonosParaEliminar);
      this.telefonosParaEliminar.forEach(idTelefono => {
        updateObservables.push(this._telefonoService.deleteTelefono(idTelefono));
      });
    }

    // 2. Procesar actualizaciones y creaciones (excluyendo los marcados para eliminación)
    telefonosValidos.forEach(telefono => {
      // Si está marcado para eliminación, no lo procesamos
      if (telefono.idTelefono && this.telefonosParaEliminar.includes(telefono.idTelefono)) {
        return;
      }

      if (telefono.idTelefono) {
        // Si tiene ID, actualizar el teléfono existente
        const updateData = {
          telefono: telefono.telefono,
          tipoTel: telefono.tipoTel
        };
        console.log(`Actualizando teléfono ID ${telefono.idTelefono}:`, updateData);
        updateObservables.push(this._telefonoService.updateTelefono(telefono.idTelefono, updateData));
      } else {
        // Si no tiene ID, crear un nuevo teléfono
        const newTelefonoData = {
          idUsuario: this.user.idUsuario,
          telefono: telefono.telefono,
          tipoTel: telefono.tipoTel
        };
        console.log('Creando nuevo teléfono:', newTelefonoData);
        updateObservables.push(this._telefonoService.createTelefono(newTelefonoData));
      }
    });

    // Si no hay operaciones que realizar, solo mostrar éxito y navegar
    if (updateObservables.length === 0) {
      this.showAlert('success', 'Usuario actualizado correctamente');
      this.navigateBackAfterDelay();
      return;
    }

    console.log('Operaciones de teléfonos a ejecutar:', updateObservables.length);
    
    // Ejecutar todas las operaciones de teléfonos en paralelo
    forkJoin(updateObservables).subscribe({
      next: (responses) => {
        console.log('Todas las operaciones de teléfonos completadas:', responses);
        this.showAlert('success', 'Usuario y teléfonos actualizados correctamente');
        this.navigateBackAfterDelay();
      },
      error: (error) => {
        console.error('Error al procesar teléfonos:', error);
        this.showAlert('error', 'Usuario actualizado, pero hubo un error al procesar los teléfonos');
        this.navigateBackAfterDelay();
      }
    });
  }

  /**
   * Navega de vuelta a la lista de usuarios después de un delay
   */
  private navigateBackAfterDelay(): void {
    // Recargar los datos del usuario actualizado para asegurar sincronización
    this.loadUser(this.user.email);
    
    // Navegar de vuelta a la lista de usuarios
    setTimeout(() => {
      this._router.navigate(['/view-users']);
    }, 2000);
  }
}