# Configuración de Fecha de Creación del Usuario en Keycloak

## Problema
Por defecto, Keycloak NO incluye la fecha de creación del usuario (`createdTimestamp`) en el token JWT. Solo incluye:
- `iat` (issued at): Fecha de emisión del token (se renueva constantemente)
- `exp` (expiration): Fecha de expiración del token

Para mostrar la **fecha real de creación del usuario**, necesitamos agregar un **Protocol Mapper** personalizado.

---

## Solución: Agregar Protocol Mapper en Keycloak

### Opción 1: Script Mapper (RECOMENDADO)

1. **Accede a Keycloak Admin Console**
   - URL: `http://localhost:8080`
   - Inicia sesión con tu cuenta de administrador

2. **Navega al cliente**
   - Ve a: **Clients** → **segar-frontend**

3. **Accede a Client Scopes**
   - Click en la pestaña **"Client scopes"**
   - Click en **"segar-frontend-dedicated"**

4. **Agregar nuevo Mapper**
   - Ve a la pestaña **"Mappers"**
   - Click en **"Add mapper"** → **"By configuration"**
   - Selecciona **"Script Mapper"**

5. **Configurar el Mapper**
   ```
   Name: user-created-timestamp
   Token Claim Name: user_created_timestamp
   Claim JSON Type: Long
   Script: user.getCreatedTimestamp()
   Multivalued: OFF
   Add to ID token: ON
   Add to access token: ON
   Add to userinfo: ON
   ```

6. **Guardar**

---

### Opción 2: User Attribute Mapper (Alternativa)

Si la Opción 1 no funciona (algunos Keycloak tienen scripts deshabilitados):

1. Sigue los pasos 1-4 de arriba
2. En lugar de "Script Mapper", selecciona **"User Attribute"**
3. Configurar:
   ```
   Name: user-created-timestamp
   User Attribute: createdTimestamp
   Token Claim Name: user_created_timestamp
   Claim JSON Type: Long
   Add to ID token: ON
   Add to access token: ON
   Add to userinfo: ON
   ```

---

## Verificación

### 1. Reinicia sesión
Después de configurar el mapper, debes **cerrar sesión** y volver a iniciar sesión para obtener un nuevo token con el campo.

### 2. Verifica el token en la consola del navegador
```javascript
debugAuth()
```

Deberías ver en la consola:
```javascript
👤 Token parseado completo: {
  ...
  user_created_timestamp: 1729123456789,  // ← Este campo debe aparecer
  ...
}
👤 Fecha de creación del usuario: Thu Oct 16 2025 10:30:56 GMT-0500
```

### 3. Verifica en jwt.io
Copia el token de acceso y pégalo en [https://jwt.io](https://jwt.io)

En el payload deberías ver:
```json
{
  "exp": 1729123456,
  "iat": 1729123456,
  "user_created_timestamp": 1697654400000,
  "preferred_username": "admin",
  ...
}
```

---

## Troubleshooting

### El campo no aparece en el token

**Causa**: El mapper no está configurado correctamente o no está asignado al cliente.

**Solución**:
1. Verifica que el mapper esté en **"segar-frontend-dedicated"** scope
2. Verifica que el scope esté asignado al cliente
3. Cierra sesión completamente y vuelve a iniciar sesión

### El campo aparece como null o undefined

**Causa**: El usuario fue creado antes de que Keycloak registrara timestamps.

**Solución**:
- Los usuarios antiguos pueden no tener `createdTimestamp`
- Crea un usuario nuevo de prueba para verificar
- Considera usar `iat` como fallback (ya implementado en el código)

### Scripts deshabilitados en Keycloak

**Causa**: Por seguridad, algunos Keycloak tienen los scripts deshabilitados.

**Solución**:
- Usa la **Opción 2** (User Attribute Mapper)
- O habilita scripts en Keycloak con la variable de entorno:
  ```bash
  -Dkeycloak.profile.feature.scripts=enabled
  ```

---

## Código implementado

El código ya está configurado en `auth.service.ts`:

```typescript
createdAt: tokenParsed.user_created_timestamp 
  ? new Date(tokenParsed.user_created_timestamp) 
  : undefined
```

Y en `user-profile-card.component.ts`:

```typescript
private getJoinDate(): string {
  const user = this.authService.getUser();
  
  if (user?.createdAt) {
    return user.createdAt.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  return 'Fecha no disponible';
}
```

---

## Resultado esperado

Una vez configurado correctamente, en el perfil del usuario se mostrará:

```
📅 Se unió el 16 de octubre de 2024
```

(En lugar de "Fecha no disponible")

