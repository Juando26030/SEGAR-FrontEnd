# Sistema de Notificaciones - SEGAR Frontend

Este sistema proporciona una implementación completa de notificaciones para la aplicación Angular, incluyendo notificaciones toast, centro de notificaciones, configuración personalizable y notificaciones del navegador.

## 🌟 Características

- ✅ **Notificaciones Toast**: Mensajes emergentes con auto-ocultación configurable
- ✅ **Centro de Notificaciones**: Panel desplegable con historial de notificaciones
- ✅ **Configuración Personalizable**: Control completo sobre tipos y comportamiento
- ✅ **Notificaciones del Navegador**: Push notifications nativas del navegador
- ✅ **Sonidos**: Audio opcional para alertas
- ✅ **Acciones**: Botones de acción en notificaciones
- ✅ **Tipos**: Success, Error, Warning, Info
- ✅ **Persistencia**: Configuración guardada en localStorage

## 📁 Estructura de Archivos

```
src/app/
├── services/
│   └── notification.service.ts           # Servicio principal de notificaciones
├── components/
│   ├── notification-toast/
│   │   └── notification-toast.component.ts    # Componente de notificaciones toast
│   ├── notification-center/
│   │   └── notification-center.component.ts   # Centro de notificaciones en header
│   ├── notification-settings/
│   │   └── notification-settings.component.ts # Configuración de notificaciones
│   └── notification-demo/
│       └── notification-demo.component.ts     # Componente de demostración
└── layout/menu-layout/
    ├── menu-layout.component.ts         # Layout principal actualizado
    └── menu-layout.component.html       # Template con componentes de notificación
```

## 🚀 Instalación y Configuración

### 1. Importar en el Layout Principal

El sistema ya está integrado en `menu-layout.component.ts`:

```typescript
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { NotificationToastComponent } from '../../components/notification-toast/notification-toast.component';

@Component({
  imports: [CommonModule, RouterModule, NotificationCenterComponent, NotificationToastComponent]
})
export class MenuLayoutComponent { }
```

### 2. Configurar Rutas

En `app.routes.ts`, se agregó la ruta para configuración:

```typescript
{ path: 'notificaciones', component: NotificationSettingsComponent }
```

### 3. Usar el Servicio en Componentes

```typescript
import { NotificationService } from '../services/notification.service';

constructor(private notificationService: NotificationService) {}

// Ejemplo de uso
this.notificationService.success('Éxito', 'Operación completada correctamente');
```

## 📖 Guía de Uso

### Tipos de Notificaciones Básicas

```typescript
// Notificación de éxito
this.notificationService.success('Título', 'Mensaje de éxito');

// Notificación de error (no se oculta automáticamente)
this.notificationService.error('Error', 'Algo salió mal');

// Notificación de advertencia
this.notificationService.warning('Advertencia', 'Revisa esto');

// Notificación informativa
this.notificationService.info('Información', 'Datos importantes');
```

### Notificaciones con Acciones

```typescript
this.notificationService.show({
  type: 'warning',
  title: '¿Confirmar eliminación?',
  message: 'Esta acción no se puede deshacer',
  autoHide: false,
  actions: [
    {
      label: 'Eliminar',
      type: 'primary',
      action: () => {
        // Lógica de eliminación
        this.deleteItem();
      }
    },
    {
      label: 'Cancelar',
      type: 'secondary',
      action: () => {
        // Lógica de cancelación
        console.log('Cancelado');
      }
    }
  ]
});
```

### Configuración Personalizada

```typescript
// Actualizar configuración
this.notificationService.updateSettings({
  emailNotifications: true,
  pushNotifications: true,
  notificationSound: false,
  toastDuration: 8000 // 8 segundos
});

// Obtener configuración actual
this.notificationService.getSettings().subscribe(settings => {
  console.log('Configuración actual:', settings);
});
```

### Gestión de Notificaciones

```typescript
// Obtener todas las notificaciones
this.notificationService.getNotifications().subscribe(notifications => {
  console.log('Notificaciones:', notifications);
});

// Marcar como leída
this.notificationService.markAsRead(notificationId);

// Marcar todas como leídas
this.notificationService.markAllAsRead();

// Limpiar todas las notificaciones
this.notificationService.clear();

// Obtener conteo de no leídas
this.notificationService.getUnreadCount().subscribe(count => {
  console.log('Notificaciones no leídas:', count);
});
```

## 🎨 Componentes UI

### NotificationToastComponent
- Muestra notificaciones emergentes en la esquina superior derecha
- Auto-ocultación configurable
- Barra de progreso visual
- Botón de cierre manual

### NotificationCenterComponent  
- Icono de campana en el header con contador de no leídas
- Panel desplegable con historial
- Acciones rápidas (marcar como leída, eliminar)
- Filtrado por tipo y estado

### NotificationSettingsComponent
- Configuración completa de preferencias
- Toggles para cada tipo de notificación
- Control de duración y sonido
- Botones de prueba para cada tipo

## 🔧 Configuración Avanzada

### Personalizar Estilos

Los componentes usan Tailwind CSS. Puedes personalizar los estilos modificando las clases en cada componente:

```typescript
// En notification-toast.component.ts
getToastClasses(type: string): string {
  const baseClasses = 'bg-white border-l-4 shadow-lg';
  const typeClasses = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  };
  return `${baseClasses} ${typeClasses[type]}`;
}
```

### Agregar Nuevos Tipos

```typescript
// En notification.service.ts - Extender la interfaz
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'custom';

// Agregar método personalizado
custom(title: string, message: string): void {
  this.show({ type: 'custom', title, message });
}
```

### Integración con Backend

```typescript
// Ejemplo de integración con WebSockets
private connectWebSocket(): void {
  const ws = new WebSocket('ws://localhost:3000/notifications');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    this.notificationService.show(notification);
  };
}
```

## 🎯 Casos de Uso Comunes

### 1. Notificaciones de Sistema
```typescript
// En configuracion.component.ts
saveConfiguration(): void {
  // ... lógica de guardado
  this.notificationService.success(
    'Configuración guardada',
    'Tus preferencias han sido actualizadas correctamente'
  );
}
```

### 2. Validaciones de Formulario
```typescript
onSubmit(): void {
  if (!this.form.valid) {
    this.notificationService.error(
      'Error de validación',
      'Por favor completa todos los campos requeridos'
    );
    return;
  }
  // ... procesar formulario
}
```

### 3. Confirmaciones de Acciones
```typescript
deleteUser(userId: string): void {
  this.notificationService.show({
    type: 'warning',
    title: '¿Eliminar usuario?',
    message: 'Esta acción no se puede deshacer',
    autoHide: false,
    actions: [
      {
        label: 'Confirmar',
        type: 'primary',
        action: () => this.confirmDelete(userId)
      },
      {
        label: 'Cancelar',
        type: 'secondary',
        action: () => console.log('Cancelado')
      }
    ]
  });
}
```

## 🐛 Solución de Problemas

### Las notificaciones no aparecen
- Verifica que `NotificationToastComponent` esté importado en el layout
- Revisa la consola del navegador por errores
- Confirma que el servicio esté inyectado correctamente

### Los sonidos no funcionan
- Verifica que `notificationSound` esté habilitado en la configuración
- Algunos navegadores requieren interacción del usuario antes de reproducir audio
- Revisa la configuración de permisos del navegador

### Las notificaciones del navegador no aparecen
- Verifica que los permisos estén otorgados en el navegador
- Usa `Notification.requestPermission()` si es necesario
- Solo funciona en contextos seguros (HTTPS)

## 📱 Accesibilidad

El sistema incluye características de accesibilidad:
- Navegación por teclado
- Roles y atributos ARIA apropiados
- Contraste de colores accesible
- Soporte para lectores de pantalla

## 🔄 Actualizaciones Futuras

Características planificadas:
- [ ] Plantillas de notificación personalizables
- [ ] Integración con FCM (Firebase Cloud Messaging)
- [ ] Notificaciones programadas
- [ ] Análisis y métricas de notificaciones
- [ ] Soporte para i18n (internacionalización)

## 📝 Notas de Desarrollo

- El servicio usa BehaviorSubject para gestión de estado reactivo
- Las configuraciones se persisten en localStorage
- Los componentes son standalone para mejor modularidad
- Compatible con Angular 17+ y Tailwind CSS

## 🤝 Contribución

Para contribuir al sistema de notificaciones:
1. Revisa el código existente para mantener consistencia
2. Agrega tests para nuevas funcionalidades
3. Documenta cambios en este README
4. Sigue las convenciones de naming de Angular
