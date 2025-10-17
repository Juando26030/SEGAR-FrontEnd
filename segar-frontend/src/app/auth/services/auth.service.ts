import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak: Keycloak | undefined;
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    // Exponer métodos de debugging para facilitar el diagnóstico
    this.exposeToWindow();
  }

  // Inicialización manual de Keycloak (sin auto-login)
  async initKeycloakSilent(): Promise<void> {
    try {
      if (!this.keycloak) {
        console.log('🔧 Inicializando Keycloak en modo silencioso...');
        this.keycloak = new Keycloak({
          url: 'https://35.238.19.224',
          realm: 'segar',
          clientId: 'segar-frontend'
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
        url: 'https://35.238.19.224',
        realm: 'segar',
        clientId: 'segar-frontend'
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
      console.log('👤 Resource access:', tokenParsed?.resource_access);

      // Extraer roles de resource_access.segar-backend.roles
      const roles = tokenParsed?.resource_access?.['segar-backend']?.roles || [];
      console.log('👤 Roles extraídos de segar-backend:', roles);

      // Usar datos del token en lugar de loadUserProfile() que puede fallar
      const userInfo: UserInfo = {
        username: tokenParsed.preferred_username || '',
        email: tokenParsed.email || '',
        fullName: tokenParsed.name || `${tokenParsed.given_name || ''} ${tokenParsed.family_name || ''}`.trim(),
        roles: roles
      };

      console.log('👤 UserInfo creado:', userInfo);
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
          url: 'https://35.238.19.224',
          realm: 'segar',
          clientId: 'segar-frontend'
        });
        console.log('✅ Instancia de Keycloak creada');
      }

      console.log('📡 Haciendo petición al servidor de tokens...');
      const response = await fetch('https://35.238.19.224/realms/segar/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'segar-frontend',
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
            url: 'https://35.238.19.224',
            realm: 'segar',
            clientId: 'segar-frontend'
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
    console.log('🚪 Cerrando sesión...');

    // Limpiar el estado de autenticación
    this.userSubject.next(null);

    // Limpiar localStorage si es necesario
    localStorage.removeItem('userInfo');

    // Redirigir al login
    console.log('✅ Sesión cerrada correctamente');
    window.location.href = '/auth/login';
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
}
