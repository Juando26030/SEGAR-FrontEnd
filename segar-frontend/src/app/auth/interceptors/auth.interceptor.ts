import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // ⚠️ NO interceptar peticiones al SERVIDOR de Keycloak (puerto 8080)
  // Solo excluir si es una petición directa al servidor de Keycloak, no rutas del backend
  if (req.url.includes('localhost:8080')) {
    console.log('🔓 Permitiendo petición al servidor de Keycloak sin interceptar:', req.url);
    return next(req);
  }

  // Solo agregar el token si:
  // 1. Existe un token
  // 2. La request es a nuestro backend (localhost:8090)
  // 3. NO es una ruta pública (como /auth/login en el backend)
  if (token && req.url.includes('localhost:8090')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    console.log('🔐 Adding auth header to request:', req.url);

    // Interceptar SOLO errores de autenticación (401)
    // NO cerrar sesión por otros errores (404, 500, etc.)
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo manejar errores 401 (Unauthorized)
        if (error.status === 401) {
          console.error('❌ ERROR 401: Token expirado o inválido');
          console.error('❌ URL que falló:', req.url);
          console.error('❌ Token usado:', token?.substring(0, 50) + '...');

          // Verificar si ya estamos en el proceso de redirigir
          const alreadyRedirecting = sessionStorage.getItem('redirecting_to_login');

          if (!alreadyRedirecting) {
            sessionStorage.setItem('redirecting_to_login', 'true');

            console.log('🚪 Cerrando sesión y redirigiendo al login...');

            // Limpiar la sesión completamente
            authService.stopTokenRefresh();
            localStorage.clear();
            sessionStorage.clear();
            sessionStorage.setItem('session_expired', 'true');
            sessionStorage.setItem('session_expired_reason', 'Tu sesión expiró. Por favor, inicia sesión nuevamente.');

            // Usar setTimeout para evitar problemas de timing
            setTimeout(() => {
              sessionStorage.removeItem('redirecting_to_login');
              window.location.href = '/auth/login';
            }, 100);
          }
        }

        // Para otros errores (404, 500, etc.), simplemente propagar el error
        // sin cerrar la sesión
        return throwError(() => error);
      })
    );
  }

  // Si no hay token o no es para el backend, dejar pasar sin modificar
  return next(req);
};
