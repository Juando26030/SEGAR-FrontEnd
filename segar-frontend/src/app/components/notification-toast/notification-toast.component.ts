import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div 
        *ngFor="let notification of notifications" 
        [class]="getToastClasses(notification.type)"
        class="transform transition-all duration-300 ease-in-out rounded-lg shadow-lg border-l-4 p-4 relative overflow-hidden">
        
        <!-- Progress bar for auto-hide -->
        <div 
          *ngIf="notification.autoHide"
          class="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 transition-all duration-linear"
          [style.width.%]="100"
          [style.animation]="'progress ' + (notification.duration || 5000) + 'ms linear'">
        </div>
        
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3">
            <svg [class]="getIconClasses(notification.type)" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="notification.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              <path *ngIf="notification.type === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              <path *ngIf="notification.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
              <path *ngIf="notification.type === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold mb-1" [class]="getTitleClasses(notification.type)">
              {{ notification.title }}
            </h4>
            <p class="text-sm" [class]="getMessageClasses(notification.type)">
              {{ notification.message }}
            </p>
            
            <!-- Actions -->
            <div *ngIf="notification.actions && notification.actions.length > 0" class="mt-3 flex space-x-2">
              <button 
                *ngFor="let action of notification.actions"
                (click)="executeAction(action, notification.id)"
                [class]="getActionButtonClasses(action.type || 'secondary')"
                class="text-xs px-3 py-1 rounded font-medium transition-colors">
                {{ action.label }}
              </button>
            </div>
          </div>
          
          <button 
            (click)="dismiss(notification.id)"
            class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <style>
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    </style>
  `,
  styles: []
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => {
        // Solo mostrar notificaciones recientes (últimas 5)
        this.notifications = notifications.slice(0, 5);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(id: string): void {
    this.notificationService.remove(id);
  }

  executeAction(action: any, notificationId: string): void {
    action.action();
    this.dismiss(notificationId);
  }

  getToastClasses(type: string): string {
    const baseClasses = 'bg-white border-l-4 shadow-lg';
    const typeClasses = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    };
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`;
  }

  getIconClasses(type: string): string {
    const typeClasses = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.info;
  }

  getTitleClasses(type: string): string {
    const typeClasses = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.info;
  }

  getMessageClasses(type: string): string {
    const typeClasses = {
      success: 'text-green-700',
      error: 'text-red-700',
      warning: 'text-yellow-700',
      info: 'text-blue-700'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.info;
  }

  getActionButtonClasses(type: string): string {
    const typeClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    };
    return typeClasses[type as keyof typeof typeClasses] || typeClasses.secondary;
  }
}
