import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoHide?: boolean;
  duration?: number;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: boolean;
  showToasts: boolean;
  autoHideToasts: boolean;
  toastDuration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private settings$ = new BehaviorSubject<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: true,
    showToasts: true,
    autoHideToasts: true,
    toastDuration: 5000
  });

  constructor() {
    this.loadSettings();
    this.requestPermissions();
  }

  // Obtener todas las notificaciones
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  // Obtener configuración de notificaciones
  getSettings(): Observable<NotificationSettings> {
    return this.settings$.asObservable();
  }

  // Actualizar configuración
  updateSettings(settings: Partial<NotificationSettings>): void {
    const currentSettings = this.settings$.value;
    const newSettings = { ...currentSettings, ...settings };
    this.settings$.next(newSettings);
    this.saveSettings(newSettings);
  }

  // Mostrar notificación
  show(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
      autoHide: notification.autoHide ?? true,
      duration: notification.duration ?? this.settings$.value.toastDuration
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([newNotification, ...currentNotifications]);

    // Reproducir sonido si está habilitado
    if (this.settings$.value.notificationSound) {
      this.playNotificationSound();
    }

    // Mostrar notificación del navegador si está habilitado
    if (this.settings$.value.pushNotifications) {
      this.showBrowserNotification(newNotification);
    }

    // Auto-ocultar si está configurado
    if (newNotification.autoHide && this.settings$.value.autoHideToasts) {
      timer(newNotification.duration || 5000).subscribe(() => {
        this.remove(newNotification.id);
      });
    }
  }

  // Métodos de conveniencia para diferentes tipos
  success(title: string, message: string, actions?: NotificationAction[]): void {
    this.show({ type: 'success', title, message, actions });
  }

  error(title: string, message: string, actions?: NotificationAction[]): void {
    this.show({ 
      type: 'error', 
      title, 
      message, 
      actions,
      autoHide: false // Los errores no se ocultan automáticamente
    });
  }

  warning(title: string, message: string, actions?: NotificationAction[]): void {
    this.show({ type: 'warning', title, message, actions });
  }

  info(title: string, message: string, actions?: NotificationAction[]): void {
    this.show({ type: 'info', title, message, actions });
  }

  // Remover notificación
  remove(id: string): void {
    const notifications = this.notifications$.value.filter(n => n.id !== id);
    this.notifications$.next(notifications);
  }

  // Marcar como leída
  markAsRead(id: string): void {
    const notifications = this.notifications$.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$.next(notifications);
  }

  // Marcar todas como leídas
  markAllAsRead(): void {
    const notifications = this.notifications$.value.map(n => ({ ...n, read: true }));
    this.notifications$.next(notifications);
  }

  // Limpiar todas las notificaciones
  clear(): void {
    this.notifications$.next([]);
  }

  // Obtener conteo de no leídas
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  // Métodos privados
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCj+Z2e/GdCYELIHO8tiJOQcZZrvs559NEAx');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silenciar errores de reproducción de audio
      });
    } catch (error) {
      // Silenciar errores de audio
    }
  }

  private async requestPermissions(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/badge-icon.png',
        tag: notification.id
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        this.markAsRead(notification.id);
      };

      // Auto-cerrar después del tiempo configurado
      setTimeout(() => {
        browserNotification.close();
      }, notification.duration || 5000);
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.settings$.next({ ...this.settings$.value, ...settings });
      } catch (error) {
        console.warn('Error loading notification settings:', error);
      }
    }
  }

  private saveSettings(settings: NotificationSettings): void {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }

  // Métodos para simular notificaciones del sistema
  simulateSystemNotifications(): void {
    // Simular notificaciones periódicas del sistema
    setInterval(() => {
      const notifications = [
        {
          type: 'info' as const,
          title: 'Recordatorio',
          message: 'Tienes 3 trámites pendientes de revisión'
        },
        {
          type: 'warning' as const,
          title: 'Documento próximo a vencer',
          message: 'El documento #TR-2024-001 vence en 2 días'
        },
        {
          type: 'success' as const,
          title: 'Trámite completado',
          message: 'El trámite #TR-2024-003 ha sido aprobado'
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      this.show(randomNotification);
    }, 30000); // Cada 30 segundos para demo
  }
}
