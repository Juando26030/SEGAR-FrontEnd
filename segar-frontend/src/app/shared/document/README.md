# Módulo de Documentos Dinámicos - SEGAR

## Descripción

Módulo completo para la gestión de documentos dinámicos en el sistema SEGAR, diseñado específicamente para cumplir con los requisitos oficiales del INVIMA para registros sanitarios de alimentos. El módulo permite crear, gestionar y validar documentos de forma dinámica basándose en plantillas configurables.

## Características Principales

### ✅ Documentos Dinámicos
- Generación automática de formularios basados en plantillas JSON
- Soporte para más de 10 tipos de campos (texto, número, fecha, tabla, archivo, etc.)
- Validación en tiempo real client-side y server-side
- Sistema de secciones y navegación por pasos

### ✅ Plantillas Predefinidas INVIMA
- **Ficha Técnica del Producto** - Información técnica detallada según formato ASS-RSA-FM099
- **Etiqueta y Rotulado** - Arte final con información nutricional según Resolución 810/2021
- **Certificado de Análisis** - COA con parámetros fisicoquímicos y microbiológicos
- **Formulario de Solicitud** - Datos del solicitante y producto
- **Comprobante de Pago** - Recibo de tasas INVIMA
- Y más documentos según requisitos oficiales

### ✅ Gestión de Archivos
- Carga de archivos drag & drop
- Validación de tipos MIME y tamaños
- Preview de imágenes
- Almacenamiento configurable (local/S3/MinIO)

### ✅ Exportación a PDF
- Generación server-side de PDFs estandarizados
- Plantillas personalizables
- Incluye datos del formulario y archivos adjuntos

### ✅ Integración Completa
- Compatible con sistema de trámites existente
- Estado reactivo con BehaviorSubjects
- Validación de completitud por paso
- Notificaciones automáticas

## Estructura de Archivos

```
src/app/shared/document/
├── document.module.ts                    # Módulo principal
├── document-menu/                        # Componente overlay de gestión
│   ├── document-menu.component.ts
│   ├── document-menu.component.html
│   └── document-menu.component.css
├── document-form/                        # Generador de formularios dinámicos
│   ├── document-form.component.ts
│   ├── document-form.component.html
│   └── document-form.component.css
├── document-list/                        # Lista y gestión de documentos
│   ├── document-list.component.ts
│   ├── document-list.component.html
│   └── document-list.component.css
├── document-export/                      # Exportación a PDF
│   ├── document-export.component.ts
│   ├── document-export.component.html
│   └── document-export.component.css
├── dynamic-field/                        # Campos dinámicos reutilizables
│   ├── dynamic-field.component.ts
│   ├── dynamic-field.component.html
│   └── dynamic-field.component.css
├── file-upload/                          # Componente de carga de archivos
│   ├── file-upload.component.ts
│   ├── file-upload.component.html
│   └── file-upload.component.css
└── document-validation/                  # Validación y reportes
    ├── document-validation.component.ts
    ├── document-validation.component.html
    └── document-validation.component.css

src/app/core/
├── DTOs/
│   ├── document-template.dto.ts          # Tipos para plantillas
│   └── document-instance.dto.ts          # Tipos para instancias
└── services/
    ├── document.service.ts               # Servicio principal de documentos
    ├── document-template.service.ts      # Plantillas predefinidas INVIMA
    └── sample-data.service.ts            # Datos de ejemplo
```

## Uso Básico

### 1. Importar el módulo

```typescript
import { DocumentModule } from './shared/document/document.module';

@NgModule({
  imports: [
    // ... otros módulos
    DocumentModule
  ]
})
export class AppModule { }
```

### 2. Usar el componente de menú de documentos

```html
<!-- En un paso del trámite -->
<app-document-menu
  [tramiteId]="tramite.idTramite"
  [currentStep]="currentStep"
  [isVisible]="showDocumentMenu">
</app-document-menu>
```

### 3. Usar el generador de formularios

```html
<app-document-form
  [template]="selectedTemplate"
  [tramiteId]="tramiteId"
  [existingInstance]="documentInstance"
  (documentSaved)="onDocumentSaved($event)">
</app-document-form>
```

### 4. Listar documentos

```html
<app-document-list
  [tramiteId]="tramiteId"
  [viewMode]="'table'"
  [showActions]="true"
  (documentSelected)="onDocumentSelected($event)">
</app-document-list>
```

## API Backend Esperada

### Endpoints de Plantillas
```
GET    /api/document-templates                    # Lista plantillas
GET    /api/document-templates/{id}               # Detalle plantilla
POST   /api/document-templates                    # Crear plantilla (admin)
PUT    /api/document-templates/{id}               # Actualizar plantilla
```

### Endpoints de Instancias
```
GET    /api/tramites/{id}/document-templates      # Plantillas para trámite
GET    /api/tramites/{id}/document-instances      # Instancias del trámite
POST   /api/tramites/{id}/document-instances      # Crear instancia
PUT    /api/tramites/{id}/document-instances/{id} # Actualizar instancia
POST   /api/tramites/{id}/document-instances/{id}/upload      # Subir archivo
POST   /api/tramites/{id}/document-instances/{id}/export-pdf  # Exportar PDF
GET    /api/tramites/{id}/document-instances/{id}/download    # Descargar
```

## Tipos de Campos Soportados

| Tipo | Descripción | Propiedades Especiales |
|------|-------------|------------------------|
| `text` | Campo de texto simple | `maxLength`, `minLength`, `pattern` |
| `textarea` | Área de texto multilínea | `maxLength`, `rows` |
| `number` | Campo numérico | `min`, `max` |
| `email` | Campo de email con validación | - |
| `tel` | Campo de teléfono | `pattern` |
| `date` | Selector de fecha | - |
| `select` | Lista desplegable | `options[]` |
| `multiselect` | Selección múltiple | `options[]` |
| `radio` | Botones de radio | `options[]` |
| `checkbox` | Casilla de verificación | - |
| `file` | Carga de archivos | `allowedMime[]`, `maxSize`, `multiple` |
| `table` | Tabla editable | `columns[]` |
| `section-header` | Separador de secciones | - |

## Ejemplo de Plantilla

```typescript
const fichaTecnicaTemplate: DocumentTemplateDto = {
  id: 1,
  code: 'FICHA_TECNICA',
  name: 'Ficha Técnica del Producto',
  description: 'Información técnica según ASS-RSA-FM099',
  fieldsDefinition: [
    {
      key: 'nombre_comercial',
      label: 'Nombre Comercial',
      type: 'text',
      required: true,
      maxLength: 200,
      helpText: 'Nombre que aparecerá en la etiqueta'
    },
    {
      key: 'composicion',
      label: 'Composición e Ingredientes',
      type: 'table',
      required: true,
      columns: [
        { key: 'ingrediente', label: 'Ingrediente', type: 'text', required: true },
        { key: 'porcentaje', label: '% (p/p)', type: 'number', required: true },
        { key: 'funcion', label: 'Función', type: 'text', required: false }
      ]
    }
  ],
  fileRules: {
    allowedMimeTypes: ['application/pdf'],
    maxSizeBytes: 10485760,
    multipleAllowed: false
  },
  appliesToTramiteTypes: ['REGISTRO', 'MODIFICACION']
};
```

## Validaciones

El módulo incluye validación automática basada en:
- Campos requeridos
- Longitud de texto (min/max)
- Patrones regex
- Tipos de archivo permitidos
- Tamaño máximo de archivos
- Validaciones personalizadas

## Estados de Documentos

| Estado | Descripción |
|--------|-------------|
| `DRAFT` | Borrador guardado parcialmente |
| `FILLED` | Formulario completado, listo para revisión |
| `UPLOADED` | Archivo adjunto cargado |
| `VERIFIED` | Documento verificado por el sistema |
| `FINALIZED` | Documento finalizado y aprobado |
| `REJECTED` | Documento rechazado, requiere correcciones |

## Configuración

### Variables de Entorno
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://35.238.19.224:8090/api',
  fileStorage: {
    provider: 'local', // 'local' | 's3' | 'minio'
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }
};
```

## Personalización

### Agregar Nuevos Tipos de Campo
1. Extender el tipo `FieldType` en `document-template.dto.ts`
2. Agregar lógica en `dynamic-field.component.ts`
3. Agregar template en `dynamic-field.component.html`

### Crear Nueva Plantilla INVIMA
1. Agregar código en `DocumentCode` enum
2. Crear método en `DocumentTemplateService`
3. Definir `fieldsDefinition` según requisitos oficiales

## Dependencias

- Angular 19.2.0+
- Angular Reactive Forms
- RxJS 7.8.0+
- Tailwind CSS 3.3.5+

## Instalación

```bash
# Las dependencias ya están incluidas en el proyecto
# Solo asegúrese de que el módulo esté importado correctamente
```

## Compatibilidad

- ✅ Compatible con entidades existentes (`Documento`, `Tramite`, `Empresa`)
- ✅ No rompe funcionalidad actual
- ✅ Migración gradual soportada
- ✅ Retrocompatibilidad mantenida

## Futuras Mejoras

- [ ] Firma digital de documentos
- [ ] Versionado avanzado de plantillas
- [ ] Plantillas colaborativas
- [ ] Integración con servicios de terceros
- [ ] Dashboard de analíticas

## Soporte

Para reportar issues o solicitar nuevas funcionalidades, contacte al equipo de desarrollo de SEGAR.

---

**Desarrollado por el equipo SEGAR siguiendo los estándares y requisitos oficiales del INVIMA para registros sanitarios de alimentos.**
