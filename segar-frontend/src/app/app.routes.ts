import { Routes } from '@angular/router';
import { MenuLayoutComponent } from './layout/menu-layout/menu-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TramitesComponent } from './pages/tramites/tramites.component';
import { NuevoTramiteComponent } from './pages/nuevo-tramite/nuevo-tramite.component';

export const routes: Routes = [
  {
    path: '',
    component: MenuLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tramites', component: TramitesComponent },
      { path: 'nuevo', component: NuevoTramiteComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
