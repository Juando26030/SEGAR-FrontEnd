import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './auth/services/auth.service';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

// ✅ SIN APP_INITIALIZER - No inicializa Keycloak automáticamente
// ✅ Solo inicializa cuando el usuario haga login manual

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    AuthService
    // ❌ REMOVIDO: APP_INITIALIZER que causaba redirección automática
  ]
};