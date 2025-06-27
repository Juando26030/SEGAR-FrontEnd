import { Routes } from '@angular/router';
import { MenuLayoutComponent } from './layout/menu-layout/menu-layout.component';
import { PanelPrincipalComponent } from './pages/panel-principal/panel-principal.component';
import { TramitesComponent } from './pages/tramites/tramites.component';
import { NuevoTramiteComponent } from './pages/nuevo-tramite/nuevo-tramite.component';

export const routes: Routes = [
  {
    path: '',
    component: MenuLayoutComponent,
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: PanelPrincipalComponent },
      { path: 'tramites', component: TramitesComponent },
      { path: 'nuevo', component: NuevoTramiteComponent }
    ]
  },
  { path: '**', redirectTo: 'panel' }
];
