import { Routes } from '@angular/router';
import { MenuLayoutComponent } from './layout/menu-layout/menu-layout.component';
import { PanelPrincipalComponent } from './pages/panel-principal/panel-principal.component';
import { NuevoTramiteComponent } from './pages/nuevo-tramite/nuevo-tramite.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarioComponent } from './pages/calendario/calendario.component';
import { AuthPageComponent } from './auth/autenticacion/auth-page/auth-page.component';
import { LoginFormComponent } from './auth/autenticacion/login-form/login-form.component';
import { RecoverFormComponent } from './auth/autenticacion/recover-form/recover-form.component';
import {RegistroPasoUnoComponent} from './tramites/registro/registro-paso-uno/registro-paso-uno.component';
import {RegistroPasoDosComponent} from './tramites/registro/registro-paso-dos/registro-paso-dos.component';

export const routes: Routes = [
  {
    path: '',
    component: MenuLayoutComponent,
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: PanelPrincipalComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'nuevo', component: NuevoTramiteComponent },
      {
        path: 'nuevo/registro',
        children: [
          { path: 'paso-1', component: RegistroPasoUnoComponent },
          { path: 'paso-2', component: RegistroPasoDosComponent },
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
  { path: '**', redirectTo: 'panel' }
];
