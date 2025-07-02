import { Routes } from '@angular/router';
import { MenuLayoutComponent } from './layout/menu-layout/menu-layout.component';
import { PanelPrincipalComponent } from './pages/panel-principal/panel-principal.component';
import { NuevoTramiteComponent } from './pages/nuevo-tramite/nuevo-tramite.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarioComponent } from './pages/calendario/calendario.component';
import { AuthPageComponent } from './auth/autenticacion/auth-page/auth-page.component';
import { LoginFormComponent } from './auth/autenticacion/login-form/login-form.component';
import { RecoverFormComponent } from './auth/autenticacion/recover-form/recover-form.component';
import { PaginaRegistroComponent } from './pages/nuevo-usuario/pagina-registro/pagina-registro.component';
import { UserManagementComponent } from './pages/usuarios/user-management/user-management.component';
import { UserProfileComponent } from './pages/perfil-usuario/user-profile/user-profile.component';
import { RegistroPasoUnoComponent } from './tramites/registro/registro-paso-uno/registro-paso-uno.component';
import { RegistroPasoDosComponent } from './tramites/registro/registro-paso-dos/registro-paso-dos.component';
import { GeneradorDocumentosComponent } from './tramites/generador-documentos/generador-documentos.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import {RegistroPasoTresComponent} from './tramites/registro/registro-paso-tres/registro-paso-tres.component';
import { RegistroPasoCuatroComponent } from './tramites/registro/registro-paso-cuatro/registro-paso-cuatro.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MenuLayoutComponent,
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: PanelPrincipalComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'nuevo', component: NuevoTramiteComponent },
      { path: 'nuevo-usuario', component: PaginaRegistroComponent },
      { path: 'usuarios', component: UserManagementComponent },
      { path: 'perfil', component: UserProfileComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'generador-documentos', component: GeneradorDocumentosComponent },
      {
        path: 'nuevo/registro',
        children: [
          { path: 'paso-1', component: RegistroPasoUnoComponent },
          { path: 'paso-2', component: RegistroPasoDosComponent },
          { path: 'paso-3', component: RegistroPasoTresComponent },
          { path: 'paso-4', component: RegistroPasoCuatroComponent },
          { path: 'paso-5', component: RegistroPasoCincoComponent },
          { path: '', redirectTo: 'paso-1', pathMatch: 'full' }
        ]
      }
    ]
  },
  {
    path: 'auth',
    component: AuthPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginFormComponent
      },
      {
        path: 'recover',
        component: RecoverFormComponent
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
