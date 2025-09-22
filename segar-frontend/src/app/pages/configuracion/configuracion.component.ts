import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

interface UserConfig {
  // Preferencias de Usuario
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  
  // Configuración de Notificaciones
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: boolean;
  
  // Configuración de Sesión
  sessionTimeout: number; // en minutos
  rememberSession: boolean;
  
  // Cambio de Contraseña
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {
  
  // Usuario actual simulado (en una app real vendría de un servicio de auth)
  currentUser = {
    id: '1',
    name: 'Juan Díaz',
    email: 'juan.diaz@tramitespro.com',
    role: 'Administrador',
    isAdmin: true
  };

  config: UserConfig = {
    // Preferencias de Usuario
    timezone: 'America/Guatemala',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'es',
    
    // Configuración de Notificaciones
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: true,
    
    // Configuración de Sesión
    sessionTimeout: 30,
    rememberSession: false,
    
    // Cambio de Contraseña
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  originalConfig: UserConfig = { ...this.config };
  hasChanges = false;
  activeTab = 'preferences';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  tabs = [
    { 
      id: 'preferences', 
      name: 'Preferencias', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
    },
    { 
      id: 'notifications', 
      name: 'Notificaciones', 
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' 
    },
    { 
      id: 'session', 
      name: 'Sesión', 
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' 
    },
    { 
      id: 'password', 
      name: 'Contraseña', 
      icon: 'M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2h-2m0 0H9m6 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6' 
    }
  ];

  timezones = [
    { value: 'America/Guatemala', label: 'Guatemala (GMT-6)' },
    { value: 'America/Mexico_City', label: 'México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' }
  ];

  dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2025)' },
    { value: 'DD/MM/YY', label: 'DD/MM/YY (31/12/25)' }
  ];

  timeFormats = [
    { value: '24h', label: '24 horas (14:30)' },
    { value: '12h', label: '12 horas (2:30 PM)' }
  ];

  languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  sessionTimeouts = [
    { value: 5, label: '5 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 480, label: '8 horas' },
    { value: 1440, label: '24 horas' }
  ];

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.checkForChanges();
  }

  get isCurrentUserAdmin(): boolean {
    return this.currentUser.isAdmin;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  checkForChanges() {
    this.hasChanges = JSON.stringify(this.config) !== JSON.stringify(this.originalConfig);
  }

  onConfigChange() {
    this.checkForChanges();
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordsMatch(): boolean {
    return this.config.newPassword === this.config.confirmNewPassword;
  }

  getPasswordStrength(): { score: number; text: string; color: string } {
    const password = this.config.newPassword || '';
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[!@#$%^&*]/.test(password)) score += 25;
    
    if (score < 50) return { score, text: 'Débil', color: 'bg-red-500' };
    if (score < 100) return { score, text: 'Moderada', color: 'bg-yellow-500' };
    return { score, text: 'Fuerte', color: 'bg-green-500' };
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const dateFormat = this.config.dateFormat.replace('YYYY', '2025').replace('MM', '07').replace('DD', '01');
    const timeFormat = this.config.timeFormat === '12h' ? '2:30 PM' : '14:30';
    return `${dateFormat} ${timeFormat}`;
  }

  closeAllSessions() {
    if (confirm('¿Está seguro de que desea cerrar todas las sesiones activas? Será redirigido al login.')) {
      this.notificationService.info(
        'Cerrando sesiones',
        'Se están cerrando todas las sesiones activas...'
      );
      
      // Simular cierre de sesiones
      setTimeout(() => {
        this.notificationService.success(
          'Sesiones cerradas',
          'Todas las sesiones han sido cerradas correctamente'
        );
      }, 2000);
    }
  }

  saveConfiguration(): void {
    if (!this.hasChanges) return;

    // Validar contraseñas si se están cambiando
    if (this.activeTab === 'password' && this.config.newPassword) {
      if (!this.passwordsMatch) {
        this.notificationService.error('Error de validación', 'Las contraseñas no coinciden');
        return;
      }
      
      const strength = this.getPasswordStrength();
      if (strength.score < 75) {
        this.notificationService.warning('Contraseña débil', 'Por favor, usa una contraseña más segura');
        return;
      }
    }

    // Simular guardado
    setTimeout(() => {
      this.originalConfig = { ...this.config };
      this.hasChanges = false;
      
      this.notificationService.success(
        'Configuración guardada',
        'Tus preferencias han sido actualizadas correctamente'
      );
    }, 1000);
  }

  resetConfiguration(): void {
    this.config = { ...this.originalConfig };
    this.hasChanges = false;
    
    this.notificationService.info(
      'Configuración restablecida',
      'Se han restaurado los valores anteriores'
    );
  }

  restoreDefaults(): void {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración predeterminada? Se perderán todos los cambios.')) {
      this.config = {
        timezone: 'America/Guatemala',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        language: 'es',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationSound: true,
        sessionTimeout: 30,
        rememberSession: false,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      };
      
      this.hasChanges = true;
      
      this.notificationService.warning(
        'Configuración predeterminada',
        'Se han restaurado los valores predeterminados. Recuerda guardar los cambios.'
      );
    }
  }
}
