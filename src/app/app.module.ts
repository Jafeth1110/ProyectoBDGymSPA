// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // <-- necesario para HttpClient
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { UsersComponent } from './components/view-users/view-users.component';
import { routes } from './app.routes';
import { LoginComponent } from './components/login/login.component';
import { ViewTelefonousuarioComponent } from './components/view-telefonousuario/view-telefonousuario.component';
import { AddTelefonousuarioComponent } from './components/add-telefonousuario/add-telefonousuario.component';
import { ShowTelefonousuarioComponent } from './components/show-telefonousuario/show-telefonousuario.component';
import { UpdateTelefonousuarioComponent } from './components/update-telefonousuario/update-telefonousuario.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { ShowUserComponent } from './components/show-user/show-user.component';
import { ViewMantenimientoComponent } from './components/view-mantenimiento/view-mantenimiento.component';
import { AddMantenimientoComponent } from './components/add-mantenimiento/add-mantenimiento.component';
import { UpdateMantenimientoComponent } from './components/update-mantenimiento/update-mantenimiento.component';
import { ShowMantenimientoComponent } from './components/show-mantenimiento/show-mantenimiento.component';
import { ViewEquipoComponent } from './components/view-equipo/view-equipo.component';
import { UpdateEquipoComponent } from './components/update-equipo/update-equipo.component';
import { ShowEquipoComponent } from './components/show-equipo/show-equipo.component';
import { AddEquipoComponent } from './components/add-equipo/add-equipo.component';
import { ViewDetallemantenimientoComponent } from './components/view-detallemantenimiento/view-detallemantenimiento.component';
import { UpdateDetallemantenimientoComponent } from './components/update-detallemantenimiento/update-detallemantenimiento.component';
import { ShowDetallemantenimientoComponent } from './components/show-detallemantenimiento/show-detallemantenimiento.component';
import { AddDetallemantenimientoComponent } from './components/add-detallemantenimiento/add-detallemantenimiento.component';
import { TokenInterceptor } from './token.interceptor';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    AddUserComponent,
    UpdateUserComponent,
    ShowUserComponent,
    ViewTelefonousuarioComponent,
    AddTelefonousuarioComponent,
    ShowTelefonousuarioComponent,
    UpdateTelefonousuarioComponent,
    ViewMantenimientoComponent,
    UpdateMantenimientoComponent,
    ShowMantenimientoComponent,
    AddMantenimientoComponent,
    ViewEquipoComponent,
    UpdateEquipoComponent,
    ShowEquipoComponent,
    AddEquipoComponent,
    ViewDetallemantenimientoComponent,
    UpdateDetallemantenimientoComponent,
    ShowDetallemantenimientoComponent,
    AddDetallemantenimientoComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,

    
    
    

    

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,              
    HttpClientModule,         
    RouterModule.forRoot(routes)
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true 
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }