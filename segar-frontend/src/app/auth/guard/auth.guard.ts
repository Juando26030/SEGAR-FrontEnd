import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🛡️ =================================');
    console.log('🛡️ AUTH GUARD - VERIFICANDO ACCESO');
    
    const isAuth = this.authService.isAuthenticated();
    console.log('🛡️ AuthService.isAuthenticated():', isAuth);
    
    const user = this.authService.getUser();
    console.log('🛡️ Usuario actual:', user);
    
    if (isAuth) {
      console.log('✅ ACCESO PERMITIDO - Usuario autenticado');
      console.log('🛡️ =================================');
      return true;
    } else {
      console.log('❌ ACCESO DENEGADO - Usuario NO autenticado');
      console.log('🔄 Redirigiendo a /auth/login');
      console.log('🛡️ =================================');
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      console.log('✅ Usuario admin autenticado, permitiendo acceso');
      return true;
    } else if (this.authService.isAuthenticated()) {
      console.log('❌ Usuario sin permisos de admin, redirigiendo');
      this.router.navigate(['/unauthorized']);
      return false;
    } else {
      console.log('❌ Usuario NO autenticado, redirigiendo al login');
      this.router.navigate(['/auth/login']); // ← Tu login personalizado
      return false;
    }
  }
}