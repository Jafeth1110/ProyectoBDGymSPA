// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { LoginComponent } from './components/login/login.component';


export const routes: Routes = [
  {path: 'login',component:LoginComponent},
  { path: 'usuarios', component: UsersComponent },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
];
