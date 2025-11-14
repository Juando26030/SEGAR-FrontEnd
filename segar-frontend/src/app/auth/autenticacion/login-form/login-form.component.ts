import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  sessionExpiredMessage = ''; // Mensaje de sesión expirada

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService  // ← Servicio de Keycloak
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // ✅ VERIFICAR SI HAY MENSAJE DE SESIÓN EXPIRADA
    this.checkSessionExpired();

    // ✅ VERIFICAR SI VIENE DE UN LOGOUT DEL BACKOFFICE
    this.checkLogoutFromBackoffice();

    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  /**
   * Verifica si viene de un logout del backoffice y cierra la sesión de Keycloak
   */
  private checkLogoutFromBackoffice(): void {
    // Verificar si está autenticado en Keycloak
    if (this.authService.isAuthenticated()) {
      // Si está autenticado pero está en el login, significa que vino de un logout
      console.log('🚪 Usuario autenticado en login - cerrando sesión de Keycloak...');
      this.authService.logout(); // Esto cerrará la sesión de Keycloak completamente
    }
  }

  /**
   * Verifica si la sesión expiró y muestra el mensaje al usuario
   */
  private checkSessionExpired(): void {
    const sessionExpired = sessionStorage.getItem('session_expired');
    const reason = sessionStorage.getItem('session_expired_reason');

    if (sessionExpired === 'true' && reason) {
      this.sessionExpiredMessage = reason;

      // Limpiar los mensajes del sessionStorage
      sessionStorage.removeItem('session_expired');
      sessionStorage.removeItem('session_expired_reason');

      // Limpiar el mensaje después de 10 segundos
      setTimeout(() => {
        this.sessionExpiredMessage = '';
      }, 10000);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { username, password } = this.loginForm.value;

        // 🔐 AUTENTICACIÓN REAL CON KEYCLOAK
        const success = await this.authService.loginWithCredentials(username, password);

        if (success) {
          // ✅ LOGIN EXITOSO
          console.log('✅ Autenticación exitosa');

          // El sistema detecta automáticamente el rol del usuario desde el JWT
          // y redirige según corresponda (SUPER_ADMIN, ADMIN, o EMPLEADO)
          this.redirectBasedOnRole();
        } else {
          // ❌ CREDENCIALES INVÁLIDAS
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }

      } catch (error) {
        console.error('❌ Error en autenticación:', error);
        this.errorMessage = 'Error de conexión. Intenta nuevamente.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }


  private redirectBasedOnRole(): void {
    const user = this.authService.getUser();

    if (!user || !user.roles || user.roles.length === 0) {
      console.error('❌ Usuario sin roles válidos');
      this.errorMessage = 'Usuario sin permisos válidos';
      this.authService.logout();
      return;
    }

    // Convertir roles a minúsculas para comparación case-insensitive
    const rolesLowerCase = user.roles.map(role => role.toLowerCase());
    console.log('🔄 =================================');
    console.log('🔄 REDIRIGIENDO SEGÚN ROL');
    console.log('🔄 Roles originales del usuario:', user.roles);
    console.log('🔄 Roles en minúsculas:', rolesLowerCase);
    console.log('🔄 =================================');

    // ⭐ SUPER_ADMIN: Redirigir al backoffice (panel de administración SaaS)
    // Buscar variaciones del nombre del rol
    const isSuperAdmin = rolesLowerCase.some(role =>
      role === 'super_admin' ||
      role === 'super-admin' ||
      role === 'superadmin' ||
      role === 'super admin'
    );

    if (isSuperAdmin) {
      console.log('✅ Usuario SUPER_ADMIN detectado!');
      console.log('🔄 Redirigiendo a backoffice: http://localhost:4201/admin/welcome');
      window.location.href = 'http://localhost:4201/admin/welcome';
      return;
    }

    // ADMIN: Panel completo en frontend
    if (rolesLowerCase.includes('admin')) {
      console.log('✅ Usuario ADMIN detectado');
      console.log('🔄 Redirigiendo a panel de administrador');
      this.router.navigate(['/main/panel']);
      return;
    }

    // EMPLEADO: Panel limitado en frontend
    if (rolesLowerCase.includes('empleado')) {
      console.log('✅ Usuario EMPLEADO detectado');
      console.log('🔄 Redirigiendo a panel de empleado');
      this.router.navigate(['/main/panel']);
      return;
    }

    // Sin roles válidos
    console.error('❌ Usuario sin roles válidos para acceder al sistema');
    console.error('❌ Roles encontrados:', user.roles);
    console.error('❌ Roles esperados: SUPER_ADMIN, ADMIN, o EMPLEADO');
    this.errorMessage = 'Usuario sin permisos válidos. Contacte al administrador.';
    this.authService.logout();
  }  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // 🚨 Método para debugging - eliminar en producción
  onTestLogin(testUser: 'admin' | 'empleado'): void {
    if (testUser === 'admin') {
      this.loginForm.patchValue({
        username: 'admin.segar',
        password: 'admin123'
      });
    } else {
      this.loginForm.patchValue({
        username: 'empleado.segar',
        password: 'empleado123'
      });
    }
  }
}
