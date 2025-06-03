import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/error/error.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { ShowUserComponent } from './components/show-user/show-user.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  // Usuarios
  { path: 'view-users', component: ViewUsersComponent },
  { path: 'add-user', component: AddUserComponent },
  { path: 'update-user/:email', component: UpdateUserComponent },
  { path: 'show-user/:email', component: ShowUserComponent },

  // Ruta comodín (debe ir al final)
  { path: '**', component: ErrorComponent }
];
