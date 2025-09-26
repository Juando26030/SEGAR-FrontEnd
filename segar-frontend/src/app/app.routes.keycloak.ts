import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tramites',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./tramites/consulta-solicitudes/consulta-solicitudes.component').then(m => m.ConsultaSolicitudesComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./tramites/registro/registro.component').then(m => m.RegistroComponent)
      },
      {
        path: 'resolucion/:id',
        loadComponent: () => import('./tramites/resolucion-cumplimiento/resolucion-cumplimiento.component').then(m => m.ResolucionCumplimientoComponent)
      }
    ]
  },
  {
    path: 'documentos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/document/document.component').then(m => m.DocumentComponent)
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Solo administradores
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'configuracion',
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }, // Solo administradores
    loadComponent: () => import('./pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];