import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TelefonoService } from '../../services/telefono.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

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
  private originalTelefonosSnapshot: any[] = []; // snapshot para comparar cambios

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
          const telefonos = (u.telefonos || u.telefonos_list || []).map((t: any) => {
            // normalizar nombres de campos por si vienen con diferente casing
            return {
              idTelefono: t.idTelefono ?? t.id ?? null,
              idUsuario: t.idUsuario ?? t.userId ?? null,
              telefono: String(t.telefono ?? t.numero ?? '').trim(),
              tipoTel: t.tipoTel ?? t.tipo ?? 'celular'
            };
          });

          // Snapshot para comparar cambios más tarde
          this.originalTelefonosSnapshot = JSON.parse(JSON.stringify(telefonos));

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
          this.user.telefonos.forEach((tel: any, index: number) => {
            console.log(`Teléfono ${index}: tipo="${tel.tipoTel}", numero="${tel.telefono}", id=${tel.idTelefono}`);
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

  /**
   * Compara la lista original de teléfonos con la actual y determina si hubo cambios.
   * - Si hay marcas de eliminación -> hay cambios.
   * - Si longitud distinta -> hay cambios.
   * - Si algún idTelefono coincide pero cambió telefono o tipo -> hay cambios.
   */
  private telefonosHanCambiado(): boolean {
    // Si marcaste eliminaciones explícitas => cambió
    if (this.telefonosParaEliminar.length > 0) return true;

    const current = (this.user.telefonos || []).map(t => ({
      idTelefono: t.idTelefono ?? null,
      telefono: String(t.telefono ?? '').trim(),
      tipoTel: t.tipoTel ?? ''
    }));

    const original = (this.originalTelefonosSnapshot || []).map(t => ({
      idTelefono: t.idTelefono ?? null,
      telefono: String(t.telefono ?? '').trim(),
      tipoTel: t.tipoTel ?? ''
    }));

    // Si la cantidad (considerando nuevos y eliminados) es distinta -> cambió
    if (current.length !== original.length) return true;

    // Comparar por cada elemento: si existe idTelefono en original buscarlo
    for (const cur of current) {
      if (cur.idTelefono == null) {
        // teléfono nuevo
        if (cur.telefono !== '') return true;
        continue;
      }
      const orig = original.find(o => o.idTelefono == cur.idTelefono);
      if (!orig) {
        // id no encontrado: cambio
        return true;
      }
      if (orig.telefono !== cur.telefono || orig.tipoTel !== cur.tipoTel) {
        return true;
      }
    }

    // No se detectaron cambios
    return false;
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
    const telefonosValidos = (this.user.getValidTelefonos() || []).map((t: any) => ({
      idTelefono: t.idTelefono ?? null,
      telefono: String(t.telefono ?? '').trim(),
      tipoTel: t.tipoTel ?? ''
    }));
    const telefonoRegex = /^\d{8,12}$/;

    for (let telefono of telefonosValidos) {
      // Si está marcado para eliminación, lo ignoramos en validación (se eliminará)
      if (telefono.idTelefono && this.telefonosParaEliminar.includes(telefono.idTelefono)) continue;

      if (!telefono.tipoTel) {
        this.showAlert('error', 'Todos los teléfonos deben tener un tipo seleccionado.');
        return;
      }

      if (!telefonoRegex.test(telefono.telefono)) {
        this.showAlert('error', 'Los teléfonos deben tener entre 8 y 12 dígitos.');
        return;
      }

      if (!['celular', 'casa', 'trabajo', 'otro'].includes(telefono.tipoTel)) {
        this.showAlert('error', 'El tipo de teléfono debe ser: celular, casa, trabajo u otro.');
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

    // Decidir si incluir telefonos en payload:
    const hayCambiosEnTelefonos = this.telefonosHanCambiado();
    if (hayCambiosEnTelefonos) {
      // Construir array final de telefonos que se enviará al SP:
      // - Excluir los que están marcados para eliminación
      // - Asegurar que los existentes lleven idTelefono
      // - Nuevos no tienen idTelefono
      const telefonosPayload: any[] = (this.user.telefonos || []).reduce((acc: any[], t: any) => {
        // Normalizar
        const idTelefono = t.idTelefono ?? null;
        const telefono = String(t.telefono ?? '').trim();
        const tipoTel = t.tipoTel ?? 'celular';

        if (idTelefono && this.telefonosParaEliminar.includes(idTelefono)) {
          // omitido: marcado para eliminación
          return acc;
        }

        // Omitir entradas vacías (evitar crear teléfono vacío)
        if (!telefono) return acc;

        const obj: any = {
          telefono,
          tipoTel
        };
        if (idTelefono) obj.idTelefono = idTelefono;
        acc.push(obj);
        return acc;
      }, []);

      // Adjuntar telefonos al payload solo si hay al menos 1 teléfono o si hubo deletions
      // (si se borraron todos los teléfonos, envía [] para que el SP lo interprete como "sin fuentes" y elimine según MERGE)
      dataToSend.telefonos = telefonosPayload;
    }

    console.log('Datos a actualizar (final):', dataToSend);

    // Envolver en data como el backend espera
    const payload = { data: dataToSend };

    // Enviar todo en una sola llamada -> el SP hará upsert/delete según el MERGE
    this._userService.updateUser(this.user.email, payload).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          console.log('Usuario y teléfonos procesados correctamente:', response);
          this.showAlert('success', 'Usuario y teléfonos actualizados correctamente');
          // Recargar el usuario actualizado para sincronizar la vista
          this.loadUser(this.user.email);
          // Navegar atrás con un pequeño delay para que el usuario vea el mensaje
          setTimeout(() => this._router.navigate(['/view-users']), 1200);
        } else {
          console.warn('Respuesta no esperada del servidor:', response);
          this.showAlert('error', response.message || 'No se pudo actualizar el usuario');
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar usuario:', error);
        const mensaje = error?.error?.message || 'Error inesperado al actualizar';
        // Si hay errores de validación desde backend, mostrarlos
        if (error?.error?.errors) {
          const errs = Object.values(error.error.errors).flat();
          this.validationErrors = errs as string[];
        }
        this.showAlert('error', mensaje);
      }
    });

  }

  onRolChange(): void {
    // Actualizar idRol cuando cambie el rol
    this.user.idRol = this.user.getIdRol();
    console.log('Rol cambiado a:', this.user.rol, 'idRol:', this.user.idRol);
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
}
