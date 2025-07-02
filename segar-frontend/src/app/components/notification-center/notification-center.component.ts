import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Notification Bell Button -->
      <button 
        (click)="toggleDropdown()"
        class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        
        <!-- Unread Count Badge -->
        <span 
          *ngIf="unreadCount > 0" 
          class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] h-5">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- Dropdown Panel -->
      <div 
        *ngIf="isDropdownOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
        
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Notificaciones</h3>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">{{ notifications.length }} total</span>
              <button 
                *ngIf="unreadCount > 0"
                (click)="markAllAsRead()"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-64 overflow-y-auto">
          <div *ngIf="notifications.length === 0" class="px-4 py-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <p class="text-sm text-gray-500">No tienes notificaciones</p>
          </div>

          <div 
            *ngFor="let notification of notifications; trackBy: trackByNotificationId"
            (click)="markAsRead(notification.id)"
            [class.bg-blue-50]="!notification.read"
            class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            
            <div class="flex items-start space-x-3">
              <!-- Type Icon -->
              <div class="flex-shrink-0 mt-1">
                <div [class]="getNotificationIconClasses(notification.type)" class="w-2 h-2 rounded-full"></div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ notification.title }}
                  </h4>
                  <button 
                    (click)="removeNotification($event, notification.id)"
                    class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                  {{ notification.message }}
                </p>
                
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-gray-500">
                    {{ getRelativeTime(notification.timestamp) }}
                  </span>
                  
                  <!-- Type Badge -->
                  <span [class]="getTypeBadgeClasses(notification.type)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ getTypeLabel(notification.type) }}
                  </span>
                </div>
                
                <!-- Actions -->
                <div *ngIf="notification.actions && notification.actions.length > 0" class="mt-2 flex space-x-2">
                  <button 
                    *ngFor="let action of notification.actions"
                    (click)="executeAction($event, action, notification.id)"
                    class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div *ngIf="notifications.length > 0" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <button 
              (click)="clearAllNotifications()"
              class="text-xs text-red-600 hover:text-red-800 font-medium">
              Limpiar todas
            </button>
            <button 
              (click)="openNotificationSettings()"
              class="text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Configuración
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div 
      *ngIf="isDropdownOpen"
      (click)="closeDropdown()"
      class="fixed inset-0 z-40">
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `
  ]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.remove(id);
  }

  clearAllNotifications(): void {
    this.notificationService.clear();
    this.closeDropdown();
  }

  executeAction(event: Event, action: any, notificationId: string): void {
    event.stopPropagation();
    action.action();
    this.removeNotification(event, notificationId);
  }

  openNotificationSettings(): void {
    // Redirigir a la configuración de notificaciones
    this.closeDropdown();
    // Aquí puedes implementar la navegación a la configuración
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationIconClasses(type: string): string {
    const typeClasses = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.info;
  }

  getTypeBadgeClasses(type: string): string {
    const typeClasses = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.info;
  }

  getTypeLabel(type: string): string {
    const typeLabels = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Alerta',
      info: 'Info'
    };
    return typeLabels[type as keyof typeof typeLabels] || 'Info';
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString();
  }
}
