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
import { ViewAdminComponent } from './components/view-admin/view-admin.component';
import { ViewClienteComponent } from './components/view-cliente/view-cliente.component';
import { ViewEntrenadorComponent } from './components/view-entrenador/view-entrenador.component';

// Nuevos componentes
import { AddClaseComponent } from './components/add-clase/add-clase.component';
import { AddInscripcionClaseComponent } from './components/add-inscripcionclase/add-inscripcionclase.component';
import { AddMembresiaComponent } from './components/add-membresia/add-membresia.component';
import { AddMetodoPagoComponent } from './components/add-metodopago/add-metodopago.component';
import { AddPagoComponent } from './components/add-pago/add-pago.component';

// Componentes Update nuevos
import { UpdateClaseComponent } from './components/update-clase/update-clase.component';
import { UpdateInscripcionclaseComponent } from './components/update-inscripcionclase/update-inscripcionclase.component';
import { UpdateMembresiaComponent } from './components/update-membresia/update-membresia.component';
import { UpdateMetodopagoComponent } from './components/update-metodopago/update-metodopago.component';
import { UpdatePagoComponent } from './components/update-pago/update-pago.component';

// Componentes Show nuevos
import { ShowClaseComponent } from './components/show-clase/show-clase.component';
import { ShowInscripcionClaseComponent } from './components/show-inscripcionclase/show-inscripcionclase.component';
import { ShowMembresiaComponent } from './components/show-membresia/show-membresia.component';
import { ShowMetodopagoComponent } from './components/show-metodopago/show-metodopago.component';
import { ShowPagoComponent } from './components/show-pago/show-pago.component';

// Componentes View nuevos
import { ViewClaseComponent } from './components/view-clase/view-clase.component';
import { ViewInscripcionclaseComponent } from './components/view-inscripcionclase/view-inscripcionclase.component';
import { ViewMembresiaComponent } from './components/view-membresia/view-membresia.component';
import { ViewMetodopagoComponent } from './components/view-metodopago/view-metodopago.component';
import { ViewPagoComponent } from './components/view-pago/view-pago.component';


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
    ViewAdminComponent,
    ViewClienteComponent,
    ViewEntrenadorComponent,
    // Nuevos componentes
    AddClaseComponent,
    AddInscripcionClaseComponent,
    AddMembresiaComponent,
    AddMetodoPagoComponent,
    AddPagoComponent,
    // Componentes Update nuevos
    UpdateClaseComponent,
    UpdateInscripcionclaseComponent,
    UpdateMembresiaComponent,
    UpdateMetodopagoComponent,
    UpdatePagoComponent,
    // Componentes Show nuevos
    ShowClaseComponent,
    ShowInscripcionClaseComponent,
    ShowMembresiaComponent,
    ShowMetodopagoComponent,
    ShowPagoComponent,
    // Componentes View nuevos
    ViewClaseComponent,
    ViewInscripcionclaseComponent,
    ViewMembresiaComponent,
    ViewMetodopagoComponent,
    ViewPagoComponent

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