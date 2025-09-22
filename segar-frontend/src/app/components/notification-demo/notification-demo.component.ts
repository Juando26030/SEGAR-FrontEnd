import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-demo-notifications',
  standalone: true,
  imports: [],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Demo de Sistema de Notificaciones</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button 
          (click)="testSuccess()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Notificación de Éxito
        </button>
        
        <button 
          (click)="testError()"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Notificación de Error
        </button>
        
        <button 
          (click)="testWarning()"
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          Notificación de Advertencia
        </button>
        
        <button 
          (click)="testInfo()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Notificación de Información
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          (click)="testWithActions()"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Notificación con Acciones
        </button>
        
        <button 
          (click)="testPersistent()"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Notificación Persistente
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          (click)="startSimulation()"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Iniciar Simulación de Sistema
        </button>
        
        <button 
          (click)="clearAllNotifications()"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Limpiar Todas
        </button>
        
        <button 
          (click)="openSettings()"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
          Abrir Configuración
        </button>
      </div>
    </div>
  `
})
export class NotificationDemoComponent implements OnInit {

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Mostrar notificación de bienvenida
    this.notificationService.info(
      'Bienvenido al Sistema',
      'El sistema de notificaciones está activo y funcionando correctamente'
    );
  }

  testSuccess(): void {
    this.notificationService.success(
      'Operación exitosa',
      'El trámite ha sido procesado correctamente y está listo para su revisión.'
    );
  }

  testError(): void {
    this.notificationService.error(
      'Error en el sistema',
      'No se pudo procesar la solicitud. Verifique su conexión e intente nuevamente.'
    );
  }

  testWarning(): void {
    this.notificationService.warning(
      'Documento próximo a vencer',
      'El documento de identificación vence en 5 días. Renuévelo para evitar interrupciones.'
    );
  }

  testInfo(): void {
    this.notificationService.info(
      'Actualización disponible',
      'Hay una nueva versión del sistema disponible. Se instalará en el próximo reinicio.'
    );
  }

  testWithActions(): void {
    this.notificationService.show({
      type: 'warning',
      title: 'Confirmación requerida',
      message: '¿Desea proceder con la eliminación del documento?',
      autoHide: false,
      actions: [
        {
          label: 'Eliminar',
          type: 'primary',
          action: () => {
            this.notificationService.success('Documento eliminado', 'El documento ha sido eliminado exitosamente');
          }
        },
        {
          label: 'Cancelar',
          type: 'secondary',
          action: () => {
            this.notificationService.info('Operación cancelada', 'La eliminación del documento fue cancelada');
          }
        }
      ]
    });
  }

  testPersistent(): void {
    this.notificationService.show({
      type: 'info',
      title: 'Procesando solicitud',
      message: 'Su solicitud está siendo procesada. Este mensaje permanecerá hasta completar la operación.',
      autoHide: false
    });
  }

  startSimulation(): void {
    this.notificationService.simulateSystemNotifications();
    this.notificationService.info(
      'Simulación iniciada',
      'Se generarán notificaciones del sistema cada 30 segundos para demostrar la funcionalidad'
    );
  }

  clearAllNotifications(): void {
    this.notificationService.clear();
  }

  openSettings(): void {
    // En una aplicación real, esto navegaría a la configuración
    this.notificationService.info(
      'Configuración',
      'Navegar a /main/notificaciones para acceder a la configuración de notificaciones'
    );
  }
}
