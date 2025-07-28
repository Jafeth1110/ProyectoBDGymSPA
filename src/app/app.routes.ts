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
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './services/authguard.service';


export const routes: Routes = [
  
  // Usuarios
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // Home
  { path : 'home', component: HomeComponent, canActivate: [AuthGuard] },
  // Usuarios
  { path: 'view-users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'add-user', component: AddUserComponent, canActivate: [AuthGuard]  },
  { path: 'show-user/:email', component: ShowUserComponent, canActivate: [AuthGuard]  },
  { path: 'update-user/:email', component: UpdateUserComponent, canActivate: [AuthGuard]  },

  // Administradores
  { path: 'view-admin', component: ViewAdminComponent, canActivate: [AuthGuard] },

  // Clientes
  { path: 'view-cliente', component: ViewClienteComponent, canActivate: [AuthGuard] },

  // Entrenadores
  { path: 'view-entrenador', component: ViewEntrenadorComponent, canActivate: [AuthGuard] },

  // Teléfonos Usuario  
  { path: 'view-telefonousuario', component: ViewTelefonousuarioComponent, canActivate: [AuthGuard]  },
  { path: 'add-telefonousuario', component: AddTelefonousuarioComponent, canActivate: [AuthGuard]  },
  { path: 'show-telefonousuario/:id/:tipo', component: ShowTelefonousuarioComponent, canActivate: [AuthGuard]  },
  { path: 'update-telefonousuario/:id/:tipo', component: UpdateTelefonousuarioComponent, canActivate: [AuthGuard]  },  // Equipos
  { path: 'view-equipo', component: ViewEquipoComponent, canActivate: [AuthGuard]  },
  { path: 'add-equipo', component: AddEquipoComponent, canActivate: [AuthGuard]  },
  { path: 'show-equipo/:id', component: ShowEquipoComponent, canActivate: [AuthGuard]  },
  { path: 'update-equipo/:id', component: UpdateEquipoComponent, canActivate: [AuthGuard]  },

  // Mantenimiento
  { path: 'view-mantenimiento', component: ViewMantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'add-mantenimiento', component: AddMantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'show-mantenimiento/:id', component: ShowMantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'update-mantenimiento/:id', component: UpdateMantenimientoComponent, canActivate: [AuthGuard]  },

  // Detalle Mantenimiento
  { path: 'view-detallemantenimiento', component: ViewDetallemantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'add-detallemantenimiento', component: AddDetallemantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'show-detallemantenimiento/:id', component: ShowDetallemantenimientoComponent, canActivate: [AuthGuard]  },
  { path: 'update-detallemantenimiento/:id', component: UpdateDetallemantenimientoComponent, canActivate: [AuthGuard]  },

  // Ruta por defecto
  // Ruta por defecto - redirigir según el estado de autenticación
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
