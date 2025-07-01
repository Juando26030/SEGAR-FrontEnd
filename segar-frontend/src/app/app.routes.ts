import { Routes } from '@angular/router';
import { MenuLayoutComponent } from './layout/menu-layout/menu-layout.component';
import { PanelPrincipalComponent } from './pages/panel-principal/panel-principal.component';
import { TramitesComponent } from './pages/tramites/tramites.component';
import { NuevoTramiteComponent } from './pages/nuevo-tramite/nuevo-tramite.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarioComponent } from './pages/calendario/calendario.component';
import { AuthPageComponent } from './auth/autenticacion/auth-page/auth-page.component';
import { LoginFormComponent } from './auth/autenticacion/login-form/login-form.component';
import { RecoverFormComponent } from './auth/autenticacion/recover-form/recover-form.component';
import { PaginaRegistroComponent } from './pages/nuevo-usuario/pagina-registro/pagina-registro.component';

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
      { path: 'tramites', component: TramitesComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'nuevo', component: NuevoTramiteComponent },
      { path: 'nuevo-usuario', component: PaginaRegistroComponent }
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
