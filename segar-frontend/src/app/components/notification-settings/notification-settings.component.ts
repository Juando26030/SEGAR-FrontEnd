import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationSettings } from '../../services/notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Configuración de Notificaciones</h2>
          <p class="text-sm text-gray-600 mt-1">Personaliza cómo y cuándo quieres recibir notificaciones</p>
        </div>

        <div class="p-6 space-y-8">
          <!-- General Notification Settings -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Mostrar notificaciones toast</h4>
                    <p class="text-sm text-gray-500">Mostrar notificaciones emergentes en la pantalla</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="settings.showToasts"
                    (ngModelChange)="onSettingsChange()"
                    class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Auto-ocultar notificaciones</h4>
                    <p class="text-sm text-gray-500">Las notificaciones se ocultarán automáticamente</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="settings.autoHideToasts"
                    (ngModelChange)="onSettingsChange()"
                    class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div *ngIf="settings.autoHideToasts" class="p-4 bg-gray-50 rounded-lg">
                <label for="toastDuration" class="block text-sm font-medium text-gray-700 mb-2">
                  Duración de las notificaciones (segundos)
                </label>
                <input 
                  type="range" 
                  id="toastDuration"
                  [(ngModel)]="toastDurationSeconds"
                  (ngModelChange)="onDurationChange()"
                  min="1" 
                  max="30" 
                  step="1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1s</span>
                  <span class="font-medium">{{ toastDurationSeconds }}s</span>
                  <span>30s</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Types -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Tipos de Notificación</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Email</h4>
                      <p class="text-xs text-gray-500">Notificaciones por correo electrónico</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="settings.emailNotifications"
                      (ngModelChange)="onSettingsChange()"
                      class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">SMS</h4>
                      <p class="text-xs text-gray-500">Mensajes de texto para alertas críticas</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="settings.smsNotifications"
                      (ngModelChange)="onSettingsChange()"
                      class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Push</h4>
                      <p class="text-xs text-gray-500">Notificaciones del navegador</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="settings.pushNotifications"
                      (ngModelChange)="onSettingsChange()"
                      class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Sonido</h4>
                      <p class="text-xs text-gray-500">Reproducir sonido con las notificaciones</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="settings.notificationSound"
                      (ngModelChange)="onSettingsChange()"
                      class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Notifications -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Probar Notificaciones</h3>
            <p class="text-sm text-gray-600 mb-4">Envía notificaciones de prueba para verificar tu configuración</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                (click)="testNotification('success')"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                Éxito
              </button>
              <button 
                (click)="testNotification('error')"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                Error
              </button>
              <button 
                (click)="testNotification('warning')"
                class="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
                Advertencia
              </button>
              <button 
                (click)="testNotification('info')"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Información
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button 
              (click)="saveSettings()"
              [disabled]="!hasChanges"
              [class]="hasChanges 
                ? 'px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors' 
                : 'px-6 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed'">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Guardar Configuración
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
      }
      
      .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: none;
      }
    `
  ]
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  settings: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: true,
    showToasts: true,
    autoHideToasts: true,
    toastDuration: 5000
  };

  originalSettings: NotificationSettings = { ...this.settings };
  toastDurationSeconds = 5;
  hasChanges = false;

  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getSettings().subscribe(
      settings => {
        this.settings = { ...settings };
        this.originalSettings = { ...settings };
        this.toastDurationSeconds = Math.round(settings.toastDuration / 1000);
        this.hasChanges = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSettingsChange(): void {
    this.checkForChanges();
  }

  onDurationChange(): void {
    this.settings.toastDuration = this.toastDurationSeconds * 1000;
    this.checkForChanges();
  }

  private checkForChanges(): void {
    this.hasChanges = JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
  }

  saveSettings(): void {
    this.notificationService.updateSettings(this.settings);
    this.originalSettings = { ...this.settings };
    this.hasChanges = false;
    
    this.notificationService.success(
      'Configuración guardada',
      'Tus preferencias de notificación han sido actualizadas correctamente'
    );
  }

  testNotification(type: 'success' | 'error' | 'warning' | 'info'): void {
    const messages = {
      success: {
        title: 'Notificación de éxito',
        message: 'Esta es una notificación de prueba exitosa'
      },
      error: {
        title: 'Notificación de error',
        message: 'Esta es una notificación de prueba de error'
      },
      warning: {
        title: 'Notificación de advertencia',
        message: 'Esta es una notificación de prueba de advertencia'
      },
      info: {
        title: 'Notificación informativa',
        message: 'Esta es una notificación de prueba informativa'
      }
    };

    const { title, message } = messages[type];
    this.notificationService.show({ type, title, message });
  }
}
