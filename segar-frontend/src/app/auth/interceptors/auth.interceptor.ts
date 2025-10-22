import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Solo agregar el token si la request es a nuestro backend
  if (token && req.url.includes('localhost:8090')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    console.log('Adding auth header to request:', req.url);

    // Interceptar errores de autenticación
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('❌ ERROR 401: Token expirado o inválido');
          console.log('🚪 Redirigiendo al login...');

          // Limpiar la sesión completamente
          authService.stopTokenRefresh();
          localStorage.clear();
          sessionStorage.setItem('session_expired', 'true');
          sessionStorage.setItem('session_expired_reason', 'Tu sesión expiró. Por favor, inicia sesión nuevamente.');

          // Redirigir al login
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
