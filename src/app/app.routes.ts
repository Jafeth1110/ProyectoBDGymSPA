// src/app/app.routes.ts
import { Routes } from '@angular/router';
//Home
import { HomeComponent } from './components/home/home.component';
// Usuarios
import { UsersComponent } from './components/view-users/view-users.component';
import { LoginComponent } from './components/login/login.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ShowUserComponent } from './components/show-user/show-user.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';

// Admin
import { ViewAdminComponent } from './components/view-admin/view-admin.component';

// Cliente
import { ViewClienteComponent } from './components/view-cliente/view-cliente.component';

// Entrenador
import { ViewEntrenadorComponent } from './components/view-entrenador/view-entrenador.component';

// Teléfonos Usuario
import { ViewTelefonousuarioComponent } from './components/view-telefonousuario/view-telefonousuario.component';
import { AddTelefonousuarioComponent } from './components/add-telefonousuario/add-telefonousuario.component';
import { ShowTelefonousuarioComponent } from './components/show-telefonousuario/show-telefonousuario.component';
import { UpdateTelefonousuarioComponent } from './components/update-telefonousuario/update-telefonousuario.component';

// Equipos
import { ViewEquipoComponent } from './components/view-equipo/view-equipo.component';
import { AddEquipoComponent } from './components/add-equipo/add-equipo.component';
import { ShowEquipoComponent } from './components/show-equipo/show-equipo.component';
import { UpdateEquipoComponent } from './components/update-equipo/update-equipo.component';

// Mantenimiento
import { ViewMantenimientoComponent } from './components/view-mantenimiento/view-mantenimiento.component';
import { AddMantenimientoComponent } from './components/add-mantenimiento/add-mantenimiento.component';
import { ShowMantenimientoComponent } from './components/show-mantenimiento/show-mantenimiento.component';
import { UpdateMantenimientoComponent } from './components/update-mantenimiento/update-mantenimiento.component';

// Detalle Mantenimiento
import { ViewDetallemantenimientoComponent } from './components/view-detallemantenimiento/view-detallemantenimiento.component';
import { AddDetallemantenimientoComponent } from './components/add-detallemantenimiento/add-detallemantenimiento.component';
import { ShowDetallemantenimientoComponent } from './components/show-detallemantenimiento/show-detallemantenimiento.component';
import { UpdateDetallemantenimientoComponent } from './components/update-detallemantenimiento/update-detallemantenimiento.component';

// Clases
import { AddClaseComponent } from './components/add-clase/add-clase.component';
import { ShowClaseComponent } from './components/show-clase/show-clase.component';
import { UpdateClaseComponent } from './components/update-clase/update-clase.component';
import { ViewClaseComponent } from './components/view-clase/view-clase.component';

// Inscripciones Clase
import { AddInscripcionClaseComponent } from './components/add-inscripcionclase/add-inscripcionclase.component';
import { ShowInscripcionClaseComponent } from './components/show-inscripcionclase/show-inscripcionclase.component';
import { UpdateInscripcionclaseComponent } from './components/update-inscripcionclase/update-inscripcionclase.component';
import { ViewInscripcionclaseComponent } from './components/view-inscripcionclase/view-inscripcionclase.component';

// Membresías
import { AddMembresiaComponent } from './components/add-membresia/add-membresia.component';
import { ShowMembresiaComponent } from './components/show-membresia/show-membresia.component';
import { UpdateMembresiaComponent } from './components/update-membresia/update-membresia.component';
import { ViewMembresiaComponent } from './components/view-membresia/view-membresia.component';

// Métodos de Pago
import { AddMetodoPagoComponent } from './components/add-metodopago/add-metodopago.component';
import { ShowMetodopagoComponent } from './components/show-metodopago/show-metodopago.component';
import { UpdateMetodopagoComponent } from './components/update-metodopago/update-metodopago.component';
import { ViewMetodopagoComponent } from './components/view-metodopago/view-metodopago.component';

// Pagos
import { AddPagoComponent } from './components/add-pago/add-pago.component';
import { ShowPagoComponent } from './components/show-pago/show-pago.component';
import { UpdatePagoComponent } from './components/update-pago/update-pago.component';
import { ViewPagoComponent } from './components/view-pago/view-pago.component';

import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './services/authguard.service';
import { RoleGuard } from './services/role.guard';


export const routes: Routes = [
  
  // Usuarios
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // Home
  { path : 'home', component: HomeComponent, canActivate: [AuthGuard] },
  // Usuarios
  { path: 'view-users', component: UsersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'add-user', component: AddUserComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-user/:email', component: ShowUserComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-user/:email', component: UpdateUserComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Administradores
  { path: 'view-admin', component: ViewAdminComponent, canActivate: [AuthGuard] },

  // Clientes
  { path: 'view-cliente', component: ViewClienteComponent, canActivate: [AuthGuard] },

  // Entrenadores
  { path: 'view-entrenador', component: ViewEntrenadorComponent, canActivate: [AuthGuard] },

  // Teléfonos Usuario  
  { path: 'view-telefonousuario', component: ViewTelefonousuarioComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'add-telefonousuario', component: AddTelefonousuarioComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-telefonousuario/:id/:tipo', component: ShowTelefonousuarioComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-telefonousuario/:id/:tipo', component: UpdateTelefonousuarioComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },  // Equipos
  { path: 'view-equipo', component: ViewEquipoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'add-equipo', component: AddEquipoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-equipo/:id', component: ShowEquipoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-equipo/:id', component: UpdateEquipoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Mantenimiento
  { path: 'view-mantenimiento', component: ViewMantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'add-mantenimiento', component: AddMantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-mantenimiento/:id', component: ShowMantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-mantenimiento/:id', component: UpdateMantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Detalle Mantenimiento
  { path: 'view-detallemantenimiento', component: ViewDetallemantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'add-detallemantenimiento', component: AddDetallemantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-detallemantenimiento/:id', component: ShowDetallemantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-detallemantenimiento/:id', component: UpdateDetallemantenimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Clases
  { path: 'view-clase', component: ViewClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] }  },
  { path: 'add-clase', component: AddClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'show-clase/:id', component: ShowClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] }  },
  { path: 'update-clase/:id', component: UpdateClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Inscripciones Clase
  { path: 'view-inscripcionclase', component: ViewInscripcionclaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] }  },
  { path: 'add-inscripcionclase', component: AddInscripcionClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] } },
  { path: 'show-inscripcionclase/:id', component: ShowInscripcionClaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] }  },
  // Permitir que cliente también pueda actualizar desde el show por corrección de elección; incluir entrenador
  { path: 'update-inscripcionclase/:id', component: UpdateInscripcionclaseComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente', 'entrenador'] } },

  // Membresías
  { path: 'view-membresia', component: ViewMembresiaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'add-membresia', component: AddMembresiaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'show-membresia/:id', component: ShowMembresiaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'update-membresia/:id', component: UpdateMembresiaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Métodos de Pago
  { path: 'view-metodopago', component: ViewMetodopagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'add-metodopago', component: AddMetodoPagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'show-metodopago/:id', component: ShowMetodopagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },
  { path: 'update-metodopago/:id', component: UpdateMetodopagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Pagos
  { path: 'view-pago', component: ViewPagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'add-pago', component: AddPagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'show-pago/:id', component: ShowPagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'cliente'] }  },
  { path: 'update-pago/:id', component: UpdatePagoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }  },

  // Ruta por defecto
  // Ruta por defecto - redirigir según el estado de autenticación
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
