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


export const routes: Routes = [
  // Home
  { path : 'home', component: HomeComponent },
  // Usuarios
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'view-users', component: UsersComponent },
  { path: 'add-user', component: AddUserComponent },
  { path: 'show-user/:email', component: ShowUserComponent },
  { path: 'update-user/:email', component: UpdateUserComponent },

  // Teléfonos Usuario
  { path: 'view-telefonousuario', component: ViewTelefonousuarioComponent },
  { path: 'add-telefonousuario', component: AddTelefonousuarioComponent },
  { path: 'show-telefonousuario/:id', component: ShowTelefonousuarioComponent },
  { path: 'update-telefonousuario/:id', component: UpdateTelefonousuarioComponent },

  // Equipos
  { path: 'view-equipo', component: ViewEquipoComponent },
  { path: 'add-equipo', component: AddEquipoComponent },
  { path: 'show-equipo/:id', component: ShowEquipoComponent },
  { path: 'update-equipo/:id', component: UpdateEquipoComponent },

  // Mantenimiento
  { path: 'view-mantenimiento', component: ViewMantenimientoComponent },
  { path: 'add-mantenimiento', component: AddMantenimientoComponent },
  { path: 'show-mantenimiento/:id', component: ShowMantenimientoComponent },
  { path: 'update-mantenimiento/:id', component: UpdateMantenimientoComponent },

  // Detalle Mantenimiento
  { path: 'view-detallemantenimiento', component: ViewDetallemantenimientoComponent },
  { path: 'add-detallemantenimiento', component: AddDetallemantenimientoComponent },
  { path: 'show-detallemantenimiento/:id', component: ShowDetallemantenimientoComponent },
  { path: 'update-detallemantenimiento/:id', component: UpdateDetallemantenimientoComponent },

  // Ruta por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
