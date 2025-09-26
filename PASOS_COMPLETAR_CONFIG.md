# PASOS PARA COMPLETAR LA CONFIGURACIÓN

## 1. INICIAR KEYCLOAK (después de que Docker Desktop esté corriendo)

```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin123 quay.io/keycloak/keycloak:23.0.0 start-dev
```

## 2. CONFIGURAR APP.CONFIG.TS

Actualizar tu archivo `app.config.ts` con:

```typescript
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { AuthService } from './auth/services/auth.service';

function initializeKeycloak(authService: AuthService) {
  return () => authService.initKeycloak();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    AuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [AuthService],
      multi: true
    }
  ]
};
```

## 3. PROBAR LA INTEGRACIÓN

Una vez que todo esté corriendo:

1. Backend: http://localhost:8090
2. Keycloak: http://localhost:8080  
3. Frontend: http://localhost:4200

## 4. COMANDOS PARA PROBAR

```bash
# Verificar backend
curl http://localhost:8090/actuator/health

# Verificar Keycloak
curl http://localhost:8080/realms/segar

# Obtener token de prueba
curl -X POST http://localhost:8080/realms/segar/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=segar-frontend" \
  -d "username=admin.segar" \
  -d "password=admin123"
```