import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject } from 'rxjs';
import { Observable, of, map, catchError } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service'; // Ajusta la ruta si es necesario
import { environment } from '../../../environments/environment';


export interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  fullName: string;
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
  id?: number; // ID del usuario en la base de datos local
  keycloakId?: string; // ID de Keycloak
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak: Keycloak | undefined;
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  // ========== RENOVACIÓN AUTOMÁTICA DE TOKENS ==========
  private refreshTokenInterval: any = null;
  private readonly REFRESH_INTERVAL_MS = 30 * 1000; // 30 segundos (muy frecuente para testing)
  private readonly TOKEN_MIN_VALIDITY_SECONDS = 50; // Renovar si quedan menos de 50 segundos

  // ========== DETECCIÓN DE ACTIVIDAD DEL USUARIO ==========
  private lastActivityTime: number = Date.now();
  private readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos de inactividad
  private activityListenersAttached: boolean = false;
  private inactivityCheckInterval: any = null; // Timer para verificar inactividad

  // ========== PERSISTENCIA DE SESIÓN ==========
  private readonly STORAGE_KEY_TOKEN = 'segar_access_token';
  private readonly STORAGE_KEY_REFRESH_TOKEN = 'segar_refresh_token';
  private readonly STORAGE_KEY_USER_INFO = 'segar_user_info';

  constructor(    private usuarioService: UsuarioService
  ) {
    // Exponer métodos de debugging para facilitar el diagnóstico
    this.exposeToWindow();
    // ✅ RESTAURAR SESIÓN AL INICIAR (si existe)
    this.restaurarSesionAlIniciar();
  }

  // Inicialización manual de Keycloak (sin auto-login)
  async initKeycloakSilent(): Promise<void> {
    try {
      if (!this.keycloak) {
        console.log('🔧 Inicializando Keycloak en modo silencioso...');
        this.keycloak = new Keycloak({
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        });

        // Inicialización silenciosa - NO redirige automáticamente
        await this.keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        console.log('✅ Keycloak inicializado en modo silencioso');
      }
    } catch (error) {
      console.error('❌ Error inicializando Keycloak silencioso:', error);
    }
  }

  async initKeycloak(): Promise<boolean> {
    try {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',  // No fuerza login automático
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });

      if (authenticated && this.keycloak.token) {
        this.loadUserProfile();
      }

      // Setup token refresh
      this.keycloak.onTokenExpired = () => {
        this.refreshToken();
      };

      console.log('Keycloak initialized successfully', { authenticated });
      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
      return false;
    }
  }



  private async loadUserProfile() {
    try {
      console.log('👤 =================================');
      console.log('👤 CARGANDO PERFIL DE USUARIO');

      if (!this.keycloak || !this.keycloak.tokenParsed) {
        console.error('❌ No hay token parseado disponible');
        return;
      }

      const tokenParsed = this.keycloak.tokenParsed as any;
      console.log('👤 Token parseado completo:', tokenParsed);
      console.log('👤 Realm access:', tokenParsed?.realm_access);
      console.log('👤 Resource access:', tokenParsed?.resource_access);

      // Extraer roles - buscar en realm_access y resource_access
      const realmRoles = tokenParsed?.realm_access?.roles || [];
      const backendRoles = tokenParsed?.resource_access?.['segar-backend']?.roles || [];

      // Combinar roles de ambas fuentes y eliminar duplicados
      const allRoles = [...new Set([...realmRoles, ...backendRoles])];

      console.log('👤 Roles de realm_access:', realmRoles);
      console.log('👤 Roles de resource_access.segar-backend:', backendRoles);
      console.log('👤 Todos los roles combinados:', allRoles);

      // Usar datos del token en lugar de loadUserProfile() que puede fallar
      const userInfo: UserInfo = {
        username: tokenParsed.preferred_username || '',
        email: tokenParsed.email || '',
        fullName: tokenParsed.name || `${tokenParsed.given_name || ''} ${tokenParsed.family_name || ''}`.trim(),
        roles: allRoles,
        firstName: tokenParsed.given_name,
        lastName: tokenParsed.family_name,
        // user_created_timestamp viene del mapper personalizado de Keycloak (en milisegundos)
        createdAt: tokenParsed.user_created_timestamp
          ? new Date(tokenParsed.user_created_timestamp)
          : undefined,
        id: tokenParsed.sub, // Asignar el ID de Keycloak
        keycloakId: tokenParsed.sub // Asignar el ID de Keycloak
      };

      console.log('👤 UserInfo creado:', userInfo);
      console.log('👤 Fecha de creación del usuario:', userInfo.createdAt);
      this.userSubject.next(userInfo);
      console.log('✅ PERFIL DE USUARIO CARGADO CORRECTAMENTE');
      console.log('👤 =================================');
    } catch (error) {
      console.error('❌ ERROR AL CARGAR PERFIL:', error);
      console.log('👤 =================================');
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      if (!this.keycloak) return false;

      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed');
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token', error);
      this.logout();
      return false;
    }
  }

  // ========== RENOVACIÓN CONTINUA Y SILENCIOSA DE TOKENS ==========

  /**
   * Inicia la renovación automática de tokens.
   * Se ejecuta cada 2.5 minutos para mantener la sesión activa.
   * Esto reinicia el contador de inactividad de 5 minutos en Keycloak.
   */
  startTokenRefresh(): void {
    console.log('🔄 =================================');
    console.log('🔄 INICIANDO RENOVACIÓN AUTOMÁTICA DE TOKENS');
    console.log(`🔄 Intervalo: cada ${this.REFRESH_INTERVAL_MS / 1000 / 60} minutos`);
    console.log(`🔄 Validez mínima del token: ${this.TOKEN_MIN_VALIDITY_SECONDS} segundos`);
    console.log('🔄 =================================');

    // Limpiar intervalo previo si existe
    this.stopTokenRefresh();

    // Configurar renovación periódica
    this.refreshTokenInterval = setInterval(async () => {
      await this.performTokenRefresh();
    }, this.REFRESH_INTERVAL_MS);

    console.log('✅ Renovación automática de tokens activada');
  }

  /**
   * Detiene la renovación automática de tokens.
   */
  stopTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
      console.log('🛑 Renovación automática de tokens detenida');
    }
  }

  /**
   * Ejecuta la renovación del token.
   * Utiliza el Refresh Token para obtener un nuevo Access Token.
   * SOLO renueva si ha habido actividad del usuario.
   * Cada llamada exitosa reinicia el contador de SSO Session Idle en Keycloak.
   */
  private async performTokenRefresh(): Promise<void> {
    try {
      if (!this.keycloak || !this.keycloak.authenticated) {
        console.warn('⚠️ No se puede renovar token: usuario no autenticado');
        this.stopTokenRefresh();
        return;
      }

      if (!this.keycloak.refreshToken) {
        console.error('❌ No hay Refresh Token disponible');
        this.stopTokenRefresh();
        await this.logoutOnTokenExpired();
        return;
      }

      // ⚠️ VERIFICAR INACTIVIDAD DEL USUARIO
      if (this.isUserInactive()) {
        console.log('⚠️ ===============================================');
        console.log('⚠️ USUARIO INACTIVO - NO SE RENOVARÁ EL TOKEN');
        console.log('⚠️ Esperando actividad para renovar la sesión...');
        console.log('⚠️ ===============================================');
        // NO renovar el token - dejar que expire naturalmente
        // Cuando expire, se cerrará la sesión automáticamente
        return;
      }

      console.log('🔄 Verificando vigencia del token...');
      console.log('✅ Usuario activo - verificando si se necesita renovación');

      // Verificar si el token está por expirar
      const tokenParsed = this.keycloak.tokenParsed as any;
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = (tokenParsed?.exp || 0) - now;

      console.log(`🔄 Token expira en ${expiresIn} segundos`);

      // Solo renovar si quedan menos de TOKEN_MIN_VALIDITY_SECONDS segundos
      if (expiresIn > this.TOKEN_MIN_VALIDITY_SECONDS) {
        console.log('ℹ️ Token aún válido, no se requiere renovación');
        return;
      }

      console.log('🔄 Renovando token con Refresh Token...');

      // Hacer petición de renovación con el Refresh Token
      const response = await fetch(`${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: environment.keycloak.clientId,
          refresh_token: this.keycloak.refreshToken
        })
      });

      if (response.ok) {
        const tokenData = await response.json();

        console.log('✅ Token renovado exitosamente (usuario activo)');

        // Actualizar tokens en Keycloak
        (this.keycloak as any).token = tokenData.access_token;
        (this.keycloak as any).refreshToken = tokenData.refresh_token;
        (this.keycloak as any).tokenParsed = this.parseJwt(tokenData.access_token);

        console.log('🔄 Nuevo token expira en:', new Date((this.keycloak.tokenParsed?.exp || 0) * 1000));
        console.log('✅ Contador de inactividad de Keycloak reiniciado (SSO Session Idle)');

        // ✅ ACTUALIZAR TOKEN EN LOCALSTORAGE
        this.guardarSesionEnStorage(tokenData.access_token, tokenData.refresh_token);

        // NO es necesario recargar el perfil cada vez
        // await this.loadUserProfile();
      } else {
        const errorText = await response.text();
        console.error('❌ Error al renovar token:', response.status, errorText);
        throw new Error(`Failed to refresh token: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ ERROR AL RENOVAR TOKEN:', error);
      console.error('❌ Probablemente la sesión expiró por inactividad');
      console.log('🚪 Cerrando sesión por expiración del Refresh Token...');

      // Detener la renovación automática
      this.stopTokenRefresh();

      // Cerrar sesión y redirigir al login
      await this.logoutOnTokenExpired();
    }
  }

  /**
   * Cierre de sesión especial cuando el token expira por inactividad.
   * Muestra un mensaje al usuario.
   */
  private async logoutOnTokenExpired(): Promise<void> {
    console.log('🚪 =================================');
    console.log('🚪 SESIÓN EXPIRADA POR INACTIVIDAD');
    console.log('🚪 SSO Session Idle Timeout: 5 minutos alcanzados');
    console.log('🚪 =================================');

    // Limpiar el estado de autenticación
    this.userSubject.next(null);

    // ✅ LIMPIAR LOCALSTORAGE COMPLETAMENTE
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_USER_INFO);
    localStorage.removeItem('userInfo'); // Limpiar también el viejo formato

    // Opcional: Guardar un mensaje para mostrarlo en la página de login
    sessionStorage.setItem('session_expired', 'true');
    sessionStorage.setItem('session_expired_reason', 'Tu sesión expiró por inactividad (5 minutos)');

    // Redirigir al login
    window.location.href = '/auth/login';
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.keycloak?.authenticated;
    console.log('🔍 AuthService.isAuthenticated():', authenticated);
    return authenticated;
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    if (!user?.roles) return false;

    // Buscar el rol de forma case-insensitive y con variaciones
    return user.roles.some(userRole =>
      userRole.toUpperCase() === role.toUpperCase() ||
      userRole === role ||
      (role === 'ADMIN' && userRole === 'Admin') ||
      (role === 'EMPLEADO' && (userRole === 'Empleado' || userRole === 'EMPLOYEE'))
    );
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('Admin');
  }

  isEmpleado(): boolean {
    return this.hasRole('EMPLEADO') || this.hasRole('Empleado') || this.hasRole('EMPLOYEE');
  }

  getUser(): UserInfo | null {
    return this.userSubject.value;
  }

  // Método para login con credenciales (Resource Owner Password Flow)
  async loginWithCredentials(username: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 =================================');
      console.log('🔐 INICIANDO LOGIN CON CREDENCIALES');
      console.log('🔐 Usuario:', username);
      console.log('🔐 =================================');

      // NO llamar initKeycloakSilent() - puede causar bloqueos
      // En su lugar, crear instancia básica si no existe
      if (!this.keycloak) {
        console.log('🔧 Creando instancia básica de Keycloak...');
        this.keycloak = new Keycloak({
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        });
        console.log('✅ Instancia de Keycloak creada');
      }

      console.log('📡 Haciendo petición al servidor de tokens...');
      const response = await fetch(`${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: environment.keycloak.clientId,
          username: username,
          password: password,
          scope: 'openid profile email'
        })
      });

      console.log('📡 Respuesta de Keycloak status:', response.status);

      if (response.ok) {
        const tokenData = await response.json();
        console.log('✅ TOKEN OBTENIDO EXITOSAMENTE');
        console.log('🔍 Access token (primeros 50 caracteres):', tokenData.access_token?.substring(0, 50) + '...');

        // Configurar Keycloak con el token obtenido
        if (!this.keycloak) {
          console.warn('⚠️ Keycloak no inicializado, creando instancia');
          this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
          });
        }

        // Simular que Keycloak está autenticado
        (this.keycloak as any).authenticated = true;
        (this.keycloak as any).token = tokenData.access_token;
        (this.keycloak as any).refreshToken = tokenData.refresh_token;
        (this.keycloak as any).tokenParsed = this.parseJwt(tokenData.access_token);

        console.log('🔍 Keycloak.authenticated configurado:', this.keycloak.authenticated);
        console.log('🔍 Token parseado:', this.keycloak.tokenParsed);

        // Cargar perfil del usuario
        await this.loadUserProfile();

        // ✅ GUARDAR SESIÓN EN LOCALSTORAGE
        this.guardarSesionEnStorage(tokenData.access_token, tokenData.refresh_token);

        // ✅ CONFIGURAR LISTENERS DE ACTIVIDAD
        this.setupActivityListeners();

        // ✅ INICIAR RENOVACIÓN AUTOMÁTICA DE TOKENS
        this.startTokenRefresh();

        const finalAuthState = this.isAuthenticated();
        console.log('✅ LOGIN CON CREDENCIALES COMPLETADO');
        console.log('🔍 Estado final isAuthenticated():', finalAuthState);
        console.log('🔍 Usuario cargado:', this.getUser());
        console.log('🔐 =================================');

        return finalAuthState;
      } else {
        const errorText = await response.text();
        console.error('❌ LOGIN FALLÓ');
        console.error('❌ Status:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        console.log('🔐 =================================');
        return false;
      }
    } catch (error) {
      console.error('❌ ERROR EN LOGIN:', error);
      console.log('🔐 =================================');
      return false;
    }
  }

  // Método auxiliar para parsear JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 =================================');
    console.log('🚪 CERRANDO SESIÓN MANUALMENTE');
    console.log('🚪 =================================');

    // ✅ DETENER RENOVACIÓN AUTOMÁTICA DE TOKENS
    this.stopTokenRefresh();

    // Limpiar el estado de autenticación en memoria
    this.userSubject.next(null);

    // Limpiar instancia de Keycloak
    if (this.keycloak) {
      (this.keycloak as any).authenticated = false;
      (this.keycloak as any).token = undefined;
      (this.keycloak as any).refreshToken = undefined;
      (this.keycloak as any).tokenParsed = undefined;
    }

    // ✅ LIMPIAR COMPLETAMENTE LOCALSTORAGE Y SESSIONSTORAGE
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_USER_INFO);
    localStorage.removeItem('userInfo'); // Limpiar también el viejo formato

    // Limpiar también sessionStorage
    sessionStorage.clear();

    // Limpiar cualquier otra clave relacionada con Keycloak
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('kc-') || key.includes('keycloak')) {
        localStorage.removeItem(key);
      }
    });

    console.log('✅ Sesión cerrada completamente');
    console.log('✅ LocalStorage y SessionStorage limpiados');
    console.log('🚪 =================================');

    // ✅ PREVENIR NAVEGACIÓN HACIA ATRÁS
    // Reemplazar el historial para que no se pueda volver atrás
    history.pushState(null, '', '/auth/login');

    // Redirigir al login y recargar completamente la página
    // Esto asegura que no quede ningún estado en memoria
    window.location.replace('/auth/login');
  }

  // Método para debugging
  logTokenInfo(): void {
    if (this.keycloak?.tokenParsed) {
      console.log('📋 Token info:', {
        username: this.keycloak.tokenParsed['preferred_username'],
        roles: this.keycloak.tokenParsed.resource_access?.['segar-backend']?.roles,
        exp: new Date(this.keycloak.tokenParsed.exp! * 1000),
        token: this.keycloak.token?.substring(0, 50) + '...'
      });
    } else {
      console.log('❌ No hay token disponible');
    }
  }

  // Método para debugging completo
  debugAuthState(): void {
    console.log('🔍 ===== DEBUG AUTH STATE =====');
    console.log('🔍 Keycloak instance exists:', !!this.keycloak);
    console.log('🔍 Keycloak.authenticated:', this.keycloak?.authenticated);
    console.log('🔍 AuthService.isAuthenticated():', this.isAuthenticated());
    console.log('🔍 Has token:', !!this.keycloak?.token);
    console.log('🔍 Token (first 50 chars):', this.keycloak?.token?.substring(0, 50) + '...');
    console.log('🔍 User info from service:', this.getUser());
    console.log('🔍 Roles from user info:', this.getUser()?.roles);
    console.log('🔍 Is admin?', this.isAdmin());
    console.log('🔍 Is empleado?', this.isEmpleado());
    this.logTokenInfo();
    console.log('🔍 ===========================');
  }

  // Método para hacer debugging público (accesible desde consola del navegador)
  public exposeToWindow(): void {
    (window as any).authService = this;
    (window as any).debugAuth = () => this.debugAuthState();
    console.log('🔧 AuthService expuesto en window.authService');
    console.log('🔧 Usa debugAuth() para hacer debugging');
  }

  /**
   * Restaura la sesión del usuario al iniciar la aplicación.
   * Intenta recuperar el token y la información del usuario desde el almacenamiento local.
   * Si se encuentra un token válido, se considera que el usuario está autenticado.
   */
  private async restaurarSesionAlIniciar(): Promise<void> {
    try {
      console.log('🔄 =================================');
      console.log('🔄 RESTAURANDO SESIÓN AL INICIAR');
      console.log('🔄 =================================');

      // Recuperar token de acceso
      const accessToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const refreshToken = localStorage.getItem(this.STORAGE_KEY_REFRESH_TOKEN);
      const userInfoJson = localStorage.getItem(this.STORAGE_KEY_USER_INFO);

      if (accessToken && refreshToken && userInfoJson) {
        console.log('✅ Token y usuario encontrados en almacenamiento local');

        // Configurar Keycloak con el token recuperado
        if (!this.keycloak) {
          console.warn('⚠️ Keycloak no inicializado, creando instancia');
          this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
          });
        }

        // Simular que Keycloak está autenticado
        (this.keycloak as any).authenticated = true;
        (this.keycloak as any).token = accessToken;
        (this.keycloak as any).refreshToken = refreshToken;
        (this.keycloak as any).tokenParsed = this.parseJwt(accessToken);

        console.log('🔍 Keycloak.authenticated configurado:', this.keycloak.authenticated);
        console.log('🔍 Token parseado:', this.keycloak.tokenParsed);

        // Cargar perfil del usuario
        await this.loadUserProfile();

        // Verificar la validez del token y renovar si es necesario
        const tokenExpiraEn = (this.keycloak.tokenParsed?.exp || 0) * 1000 - Date.now();
        console.log('🔄 El token expira en:', tokenExpiraEn, 'ms');

        if (tokenExpiraEn > 0 && tokenExpiraEn < this.REFRESH_INTERVAL_MS) {
          console.log('🔄 El token es válido, pero expirará pronto. Renovando...');
          await this.refreshToken();
        } else {
          console.log('✅ El token es válido y no requiere renovación');
        }

        // ✅ CONFIGURAR LISTENERS DE ACTIVIDAD
        this.setupActivityListeners();

        // ✅ INICIAR RENOVACIÓN AUTOMÁTICA DE TOKENS
        this.startTokenRefresh();
      } else {
        console.log('🔄 No se encontró sesión previa, el usuario no está autenticado');
      }
    } catch (error) {
      console.error('❌ ERROR AL RESTAURAR SESIÓN:', error);
    }
  }

  /**
   * Guarda la sesión en el almacenamiento local.
   * @param accessToken El token de acceso del usuario.
   * @param refreshToken El token de actualización del usuario.
   */
  private guardarSesionEnStorage(accessToken: string, refreshToken: string): void {
    try {
      // Guardar en localStorage
      localStorage.setItem(this.STORAGE_KEY_TOKEN, accessToken);
      localStorage.setItem(this.STORAGE_KEY_REFRESH_TOKEN, refreshToken);

      // También guardar información del usuario (opcional)
      const userInfo = this.keycloak?.tokenParsed;
      if (userInfo) {
        localStorage.setItem(this.STORAGE_KEY_USER_INFO, JSON.stringify(userInfo));
      }

      console.log('✅ Sesión guardada en almacenamiento local');
    } catch (error) {
      console.error('❌ ERROR AL GUARDAR SESIÓN EN STORAGE:', error);
    }
  }

  getUsuarioId(): Observable<number | null> {
    // Obtener el Keycloak ID del token (sub claim)
    const keycloakId = this.keycloak?.tokenParsed?.['sub'];

    if (!keycloakId) {
      console.warn('⚠️ No se pudo obtener el Keycloak ID del token');
      return of(null);
    }

    // Buscar directamente por username (más confiable que keycloakId)
    const username = this.keycloak?.tokenParsed?.['preferred_username'];

    if (username) {
      console.log('🔍 Obteniendo ID de usuario por username:', username);
      return this.usuarioService.getUsuarioByUsername(username, this.getToken()!).pipe(
        map(user => {
          console.log('✅ ID de usuario obtenido:', user.id);
          return user.id;
        }),
        catchError((error) => {
          console.error('❌ Error al obtener ID de usuario por username:', error);

          // Fallback: intentar con keycloakId solo si username falla
          console.log('🔄 Intentando fallback con Keycloak ID:', keycloakId);
          return this.usuarioService.getUsuarioByKeycloakId(keycloakId, this.getToken()!).pipe(
            map(user => {
              console.log('✅ ID de usuario obtenido por keycloakId:', user.id);
              return user.id;
            }),
            catchError((fallbackError) => {
              console.error('❌ Error en fallback por keycloakId:', fallbackError);
              return of(null);
            })
          );
        })
      );
    }

    // Si no hay username, intentar con keycloakId
    console.log('🔍 No hay username, intentando con Keycloak ID:', keycloakId);
    return this.usuarioService.getUsuarioByKeycloakId(keycloakId, this.getToken()!).pipe(
      map(user => {
        console.log('✅ ID de usuario obtenido:', user.id);
        return user.id;
      }),
      catchError((error) => {
        console.error('❌ Error al obtener ID de usuario:', error);
        return of(null);
      })
    );
  }


  // ========== DETECCIÓN DE ACTIVIDAD DEL USUARIO ==========

  /**
   * Configura los listeners de actividad del usuario.
   * Detecta SOLO actividad REAL del usuario: mouse, teclado, touch.
   * NO considera peticiones HTTP automáticas como actividad.
   */
  private setupActivityListeners(): void {
    if (this.activityListenersAttached) {
      console.log('👂 Listeners de actividad ya configurados, omitiendo...');
      return;
    }

    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      console.log('👆 Actividad del usuario detectada - reiniciando contador');
    };

    // Eventos que indican actividad REAL del usuario
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    this.activityListenersAttached = true;
    console.log('👂 Listeners de actividad configurados (solo eventos REALES del usuario)');

    // ✅ INICIAR VERIFICACIÓN PERIÓDICA DE INACTIVIDAD
    this.startInactivityMonitor();
  }

  /**
   * Inicia un monitor que verifica periódicamente si el usuario está inactivo.
   * Si detecta 5+ minutos de inactividad, cierra la sesión automáticamente.
   */
  private startInactivityMonitor(): void {
    // Verificar cada 10 segundos si el usuario está inactivo
    this.inactivityCheckInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivityTime;

      if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT_MS) {
        console.log('🚨 ==============================================');
        console.log('🚨 CERRANDO SESIÓN POR INACTIVIDAD');
        console.log(`🚨 Usuario inactivo por ${Math.floor(timeSinceLastActivity / 1000 / 60)} minutos`);
        console.log('🚨 ==============================================');

        // Detener todos los timers
        this.stopInactivityMonitor();
        this.stopTokenRefresh();

        // Cerrar sesión por inactividad
        this.logoutOnTokenExpired();
      }
    }, 10000); // Verificar cada 10 segundos

    console.log('👀 Monitor de inactividad iniciado (verifica cada 10 segundos)');
  }

  /**
   * Detiene el monitor de inactividad.
   */
  private stopInactivityMonitor(): void {
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
      this.inactivityCheckInterval = null;
      console.log('🛑 Monitor de inactividad detenido');
    }
  }

  /**
   * Verifica si el usuario ha estado inactivo por más tiempo del permitido.
   * @returns true si hay inactividad, false si hay actividad reciente
   */
  private isUserInactive(): boolean {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    const inactiveMinutes = Math.floor(timeSinceLastActivity / 1000 / 60);
    const inactiveSeconds = Math.floor((timeSinceLastActivity / 1000) % 60);
    const isInactive = timeSinceLastActivity > this.INACTIVITY_TIMEOUT_MS;

    console.log(`⏱️ Tiempo desde última actividad: ${inactiveMinutes}m ${inactiveSeconds}s`);

    if (isInactive) {
      console.log(`⚠️ Usuario INACTIVO por más de ${this.INACTIVITY_TIMEOUT_MS / 1000 / 60} minutos`);
    } else {
      console.log(`✅ Usuario ACTIVO (actividad hace ${inactiveSeconds}s)`);
    }

    return isInactive;
  }
}
