import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, from } from 'rxjs';
import { catchError, tap, delay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  DocumentTemplateDto,
  TramiteType
} from '../DTOs/document-template.dto';
import {
  DocumentInstanceDto,
  CreateDocumentInstanceDto,
  UpdateDocumentInstanceDto,
  FileUploadDto,
  ExportPdfDto,
  ExportPdfResponseDto,
  ValidationError
} from '../DTOs/document-instance.dto';
import { Producto } from '../DTOs/solicitud.dto';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}/api`;
  private documentsSubject = new BehaviorSubject<DocumentInstanceDto[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * ENDPOINTS DE PLANTILLAS
   */

  getDocumentTemplates(token: string, tramiteType?: TramiteType): Observable<DocumentTemplateDto[]> {
    let params = new HttpParams();
    if (tramiteType) {
      params = params.set('tramiteType', tramiteType);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/document-templates`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentTemplate(id: number, token: string): Observable<DocumentTemplateDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DocumentTemplateDto>(
      `${this.apiUrl}/document-templates/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createDocumentTemplate(template: Partial<DocumentTemplateDto>, token: string): Observable<DocumentTemplateDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<DocumentTemplateDto>(
      `${this.apiUrl}/document-templates`,
      template
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateDocumentTemplate(id: number, template: Partial<DocumentTemplateDto>, token: string): Observable<DocumentTemplateDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<DocumentTemplateDto>(
      `${this.apiUrl}/document-templates/${id}`,
      template
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * ENDPOINTS DE INSTANCIAS DE DOCUMENTO
   */

  // Método temporal para obtener plantillas de prueba
  private getMockTemplates(): DocumentTemplateDto[] {
    return [
      {
        id: 1,
        code: 'FORMULARIO_SOLICITUD',
        name: 'Formulario de Solicitud de Registro Sanitario',
        description: 'Formulario oficial para solicitud de registro sanitario según formato INVIMA ASS-RSA-FM099',
        fieldsDefinition: [
          {
            key: 'tipo_tramite',
            label: 'Tipo de Trámite',
            type: 'select',
            required: true,
            options: [
              { value: 'registro', label: 'Registro Sanitario' },
              { value: 'permiso', label: 'Permiso Sanitario' },
              { value: 'notificacion', label: 'Notificación Sanitaria' }
            ]
          },
          {
            key: 'producto_nombre',
            label: 'Nombre del Producto',
            type: 'text',
            required: true,
            placeholder: 'Ej: Yogurt Natural Premium',
            helpText: 'Nombre comercial completo del producto alimenticio'
          },
          {
            key: 'marca_comercial',
            label: 'Marca Comercial',
            type: 'text',
            required: true,
            placeholder: 'Ej: LacteosPremium'
          },
          {
            key: 'fabricante_razon_social',
            label: 'Razón Social del Fabricante',
            type: 'text',
            required: true,
            placeholder: 'Empresa Alimentaria S.A.S.',
            helpText: 'Razón social completa según cámara de comercio'
          },
          {
            key: 'fabricante_nit',
            label: 'NIT del Fabricante',
            type: 'text',
            required: true,
            placeholder: '900.123.456-7'
          },
          {
            key: 'fabricante_direccion',
            label: 'Dirección de la Planta de Producción',
            type: 'text',
            required: true,
            placeholder: 'Carrera 15 # 25-30, Zona Industrial'
          },
          {
            key: 'representante_legal',
            label: 'Representante Legal',
            type: 'text',
            required: true,
            placeholder: 'Juan Pérez García'
          },
          {
            key: 'categoria_producto',
            label: 'Categoría del Producto',
            type: 'select',
            required: true,
            options: [
              { value: 'lacteos', label: 'Productos lácteos' },
              { value: 'carnicos', label: 'Productos cárnicos' },
              { value: 'bebidas', label: 'Bebidas no alcohólicas' },
              { value: 'panificacion', label: 'Productos de panificación' },
              { value: 'conservas', label: 'Conservas alimenticias' }
            ]
          },
          {
            key: 'ingredientes_principales',
            label: 'Lista de Ingredientes (orden descendente por peso)',
            type: 'textarea',
            required: true,
            placeholder: 'Leche pasteurizada, cultivos lácticos, azúcar, estabilizante (pectina)...',
            helpText: 'Listar todos los ingredientes en orden descendente según su proporción en peso'
          },
          {
            key: 'vida_util',
            label: 'Vida Útil Declarada (días)',
            type: 'number',
            required: true,
            placeholder: '30'
          },
          {
            key: 'condiciones_almacenamiento',
            label: 'Condiciones de Almacenamiento',
            type: 'text',
            required: true,
            placeholder: 'Mantener refrigerado entre 2°C y 6°C'
          },
          {
            key: 'presentacion_comercial',
            label: 'Presentación Comercial',
            type: 'text',
            required: true,
            placeholder: 'Vaso plástico de 150g'
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 5242880,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 2,
        code: 'CERTIFICADO_EXISTENCIA',
        name: 'Certificado de Existencia y Representación Legal',
        description: 'Certificado expedido por Cámara de Comercio con vigencia no mayor a 30 días',
        fieldsDefinition: [
          {
            key: 'camara_comercio',
            label: 'Cámara de Comercio Emisora',
            type: 'text',
            required: true,
            placeholder: 'Cámara de Comercio de Bogotá'
          },
          {
            key: 'numero_certificado',
            label: 'Número del Certificado',
            type: 'text',
            required: true,
            placeholder: 'CC-2024-001234'
          },
          {
            key: 'fecha_expedicion',
            label: 'Fecha de Expedición',
            type: 'date',
            required: true
          },
          {
            key: 'vigencia',
            label: 'Vigencia del Certificado',
            type: 'date',
            required: true,
            helpText: 'El certificado debe tener vigencia no mayor a 30 días'
          },
          {
            key: 'archivo_certificado',
            label: 'Certificado (PDF)',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf'],
            maxSize: 5242880
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 5242880,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 3,
        code: 'FICHA_TECNICA',
        name: 'Ficha Técnica del Producto',
        description: 'Especificaciones técnicas detalladas según formato INVIMA',
        fieldsDefinition: [
          {
            key: 'composicion_cualitativa',
            label: 'Composición Cualitativa y Cuantitativa',
            type: 'textarea',
            required: true,
            placeholder: 'Leche pasteurizada 85%, azúcar 12%, cultivos lácticos 2%, estabilizante 1%',
            helpText: 'Detalle completo de ingredientes con porcentajes exactos'
          },
          {
            key: 'proceso_fabricacion',
            label: 'Descripción del Proceso de Fabricación',
            type: 'textarea',
            required: true,
            placeholder: 'Pasteurización → Inoculación → Fermentación → Enfriamiento → Envasado',
            helpText: 'Descripción paso a paso del proceso de fabricación'
          },
          {
            key: 'especificaciones_fisicoquimicas',
            label: 'Especificaciones Fisicoquímicas',
            type: 'table',
            required: true,
            columns: [
              { key: 'parametro', label: 'Parámetro', type: 'text', required: true },
              { key: 'unidad', label: 'Unidad', type: 'text', required: true },
              { key: 'limite_minimo', label: 'Límite Mínimo', type: 'text', required: false },
              { key: 'limite_maximo', label: 'Límite Máximo', type: 'text', required: false },
              { key: 'metodo_analisis', label: 'Método de Análisis', type: 'text', required: true }
            ],
            helpText: 'Incluir parámetros como pH, acidez, humedad, grasa, proteína, etc.'
          },
          {
            key: 'especificaciones_microbiologicas',
            label: 'Especificaciones Microbiológicas',
            type: 'table',
            required: true,
            columns: [
              { key: 'microorganismo', label: 'Microorganismo', type: 'text', required: true },
              { key: 'limite', label: 'Límite Máximo', type: 'text', required: true },
              { key: 'unidad', label: 'Unidad', type: 'text', required: true },
              { key: 'metodo', label: 'Método de Análisis', type: 'text', required: true }
            ]
          },
          {
            key: 'vida_util_estudios',
            label: 'Estudios de Vida Útil',
            type: 'textarea',
            required: true,
            helpText: 'Describir los estudios realizados para determinar la vida útil del producto'
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf', 'application/msword'],
          maxSizeBytes: 10485760,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 4,
        code: 'CERTIFICADO_ANALISIS',
        name: 'Certificado de Análisis Fisicoquímico y Microbiológico',
        description: 'Certificado emitido por laboratorio acreditado ante IDEAM con vigencia no mayor a 6 meses',
        fieldsDefinition: [
          {
            key: 'laboratorio_nombre',
            label: 'Nombre del Laboratorio',
            type: 'text',
            required: true,
            helpText: 'Laboratorio acreditado ante IDEAM'
          },
          {
            key: 'laboratorio_acreditacion',
            label: 'Número de Acreditación IDEAM',
            type: 'text',
            required: true,
            placeholder: 'LA-2024-001'
          },
          {
            key: 'lote_analizado',
            label: 'Lote del Producto Analizado',
            type: 'text',
            required: true,
            placeholder: 'L240315001'
          },
          {
            key: 'fecha_muestreo',
            label: 'Fecha de Muestreo',
            type: 'date',
            required: true
          },
          {
            key: 'fecha_analisis',
            label: 'Fecha de Análisis',
            type: 'date',
            required: true
          },
          {
            key: 'resultados_fisicoquimicos',
            label: 'Resultados Análisis Fisicoquímico',
            type: 'table',
            required: true,
            columns: [
              { key: 'parametro', label: 'Parámetro', type: 'text', required: true },
              { key: 'resultado', label: 'Resultado', type: 'text', required: true },
              { key: 'unidad', label: 'Unidad', type: 'text', required: true },
              { key: 'limite', label: 'Límite Especificado', type: 'text', required: true },
              { key: 'cumple', label: 'Cumple', type: 'select', required: true, options: [
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' }
              ]}
            ]
          },
          {
            key: 'resultados_microbiologicos',
            label: 'Resultados Análisis Microbiológico',
            type: 'table',
            required: true,
            columns: [
              { key: 'microorganismo', label: 'Microorganismo', type: 'text', required: true },
              { key: 'resultado', label: 'Resultado', type: 'text', required: true },
              { key: 'limite', label: 'Límite Máximo', type: 'text', required: true },
              { key: 'cumple', label: 'Cumple', type: 'select', required: true, options: [
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' }
              ]}
            ]
          },
          {
            key: 'archivo_certificado',
            label: 'Certificado Completo (PDF)',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf'],
            maxSize: 10485760,
            helpText: 'Certificado original firmado por el laboratorio'
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 10485760,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 5,
        code: 'CERTIFICADO_BPM',
        name: 'Certificado de Buenas Prácticas de Manufactura (BPM)',
        description: 'Certificado BPM expedido por INVIMA o entidad competente con vigencia de 3 años',
        fieldsDefinition: [
          {
            key: 'numero_certificado',
            label: 'Número del Certificado BPM',
            type: 'text',
            required: true,
            placeholder: 'BPM-2024-001234'
          },
          {
            key: 'entidad_emisora',
            label: 'Entidad Emisora',
            type: 'text',
            required: true,
            placeholder: 'INVIMA'
          },
          {
            key: 'fecha_expedicion',
            label: 'Fecha de Expedición',
            type: 'date',
            required: true
          },
          {
            key: 'fecha_vencimiento',
            label: 'Fecha de Vencimiento',
            type: 'date',
            required: true,
            helpText: 'Los certificados BPM tienen vigencia de 3 años'
          },
          {
            key: 'planta_certificada',
            label: 'Planta de Producción Certificada',
            type: 'text',
            required: true,
            placeholder: 'Planta Principal - Bogotá'
          },
          {
            key: 'archivo_certificado',
            label: 'Certificado BPM (PDF)',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf'],
            maxSize: 5242880
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 5242880,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 6,
        code: 'ETIQUETA_ROTULADO',
        name: 'Etiqueta y Rotulado del Producto',
        description: 'Arte final de la etiqueta cumpliendo con Resolución 5109 de 2005 y normativa vigente',
        fieldsDefinition: [
          {
            key: 'informacion_nutricional',
            label: 'Información Nutricional por Porción',
            type: 'table',
            required: true,
            columns: [
              { key: 'nutriente', label: 'Nutriente', type: 'text', required: true },
              { key: 'cantidad', label: 'Cantidad', type: 'text', required: true },
              { key: 'unidad', label: 'Unidad', type: 'text', required: true },
              { key: 'vd_porcentaje', label: '% Valor Diario', type: 'text', required: false }
            ],
            helpText: 'Incluir energía, grasa total, grasa saturada, grasa trans, colesterol, sodio, carbohidratos, fibra, azúcares, proteína'
          },
          {
            key: 'declaraciones_propiedades',
            label: 'Declaraciones de Propiedades Nutricionales',
            type: 'textarea',
            required: false,
            helpText: 'Solo si aplica. Debe estar respaldado por estudios científicos'
          },
          {
            key: 'advertencias_sanitarias',
            label: 'Advertencias Sanitarias',
            type: 'textarea',
            required: true,
            placeholder: 'Contiene lactosa. Mantener refrigerado.',
            helpText: 'Incluir todas las advertencias aplicables según la normativa'
          },
          {
            key: 'arte_final_frontal',
            label: 'Arte Final - Cara Frontal',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: 10485760
          },
          {
            key: 'arte_final_posterior',
            label: 'Arte Final - Cara Posterior',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: 10485760
          },
          {
            key: 'dimensiones_envase',
            label: 'Dimensiones del Envase',
            type: 'text',
            required: true,
            placeholder: 'Alto: 12cm, Diámetro: 7cm'
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maxSizeBytes: 10485760,
          multipleAllowed: true,
          maxFiles: 3
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 7,
        code: 'COMPROBANTE_PAGO',
        name: 'Comprobante de Pago de Derechos INVIMA',
        description: 'Recibo de pago de las tasas correspondientes al trámite ante INVIMA',
        fieldsDefinition: [
          {
            key: 'numero_recibo',
            label: 'Número de Recibo de Pago',
            type: 'text',
            required: true,
            placeholder: 'INV-2024-001234'
          },
          {
            key: 'entidad_financiera',
            label: 'Entidad Financiera',
            type: 'text',
            required: true,
            placeholder: 'Banco de Bogotá'
          },
          {
            key: 'valor_pagado',
            label: 'Valor Pagado',
            type: 'number',
            required: true,
            placeholder: '1500000'
          },
          {
            key: 'fecha_pago',
            label: 'Fecha de Pago',
            type: 'date',
            required: true
          },
          {
            key: 'referencia_pago',
            label: 'Referencia de Pago',
            type: 'text',
            required: true
          },
          {
            key: 'archivo_comprobante',
            label: 'Comprobante de Pago (PDF)',
            type: 'file',
            required: true,
            allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: 5242880
          }
        ],
        fileRules: {
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maxSizeBytes: 5242880,
          multipleAllowed: false
        },
        appliesToTramiteTypes: [TramiteType.REGISTRO],
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ];
  }

  getDocumentTemplatesForTramite(tramiteId: number): Observable<DocumentTemplateDto[]> {
    // Usar datos mock temporalmente
    return of(this.getMockTemplates()).pipe(
      delay(1000) // Simular delay de red
    );

    // Código real para producción (comentado temporalmente)
    /*
    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-templates`,
      this.getHttpOptions()
    ).pipe(
      tap(templates => console.log('Plantillas cargadas:', templates)),
      catchError(this.handleError<DocumentTemplateDto[]>('getDocumentTemplatesForTramite', []))
    );
    */
  }

  getDocumentInstancesForTramite(tramiteId: number): Observable<DocumentInstanceDto[]> {
    // Devolver array vacío temporalmente
    return of([]).pipe(
      delay(500)
    );

    // Código real para producción (comentado temporalmente)
    /*
    return this.http.get<DocumentInstanceDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances`,
      this.getHttpOptions()
    ).pipe(
      tap(instances => console.log('Instancias cargadas:', instances)),
      catchError(this.handleError<DocumentInstanceDto[]>('getDocumentInstancesForTramite', []))
    );
    */
  }

  getDocumentInstance(tramiteId: number, instanceId: number, token: string): Observable<DocumentInstanceDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createDocumentInstance(tramiteId: number, instance: CreateDocumentInstanceDto, token: string): Observable<DocumentInstanceDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances`,
      instance
    ).pipe(
      tap(() => this.refreshDocuments(tramiteId)),
      catchError(this.handleError)
    );
  }

  updateDocumentInstance(
    tramiteId: number,
    instanceId: number,
    instance: UpdateDocumentInstanceDto,
    token: string
  ): Observable<DocumentInstanceDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}`,
      instance, 
      { headers }
    ).pipe(
      tap(() => this.refreshDocuments(tramiteId)),
      catchError(this.handleError)
    );
  }

  /**
   * MANEJO DE ARCHIVOS
   */

  uploadFile(tramiteId: number, instanceId: number, fileData: FileUploadDto, token: string): Observable<DocumentInstanceDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const formData = new FormData();
    formData.append('file', fileData.file);
    if (fileData.description) {
      formData.append('description', fileData.description);
    }

    return this.http.post<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/upload`,
      formData, 
      { headers }
    ).pipe(
      tap(() => this.refreshDocuments(tramiteId)),
      catchError(this.handleError)
    );
  }

  /**
   * EXPORTACIÓN A PDF
   */

  exportToPdf(tramiteId: number, instanceId: number, options: ExportPdfDto = {}, token: string): Observable<ExportPdfResponseDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<ExportPdfResponseDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/export-pdf`,
      options,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  downloadDocument(tramiteId: number, instanceId: number, token: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/download`,
      { responseType: 'blob' , headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * VALIDACIÓN
   */

  validateDocumentData(template: DocumentTemplateDto, filledData: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!template.fieldsDefinition) {
      return errors;
    }

    template.fieldsDefinition.forEach(field => {
      const value = filledData[field.key];
      const fieldErrors = this.validateField(field, value);
      errors.push(...fieldErrors);
    });

    return errors;
  }

  private validateField(field: any, value: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validación requerido
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push({
        field: field.key,
        message: `${field.label} es requerido`,
        code: 'REQUIRED'
      });
    }

    // Validación de longitud
    if (value && typeof value === 'string') {
      if (field.minLength && value.length < field.minLength) {
        errors.push({
          field: field.key,
          message: `${field.label} debe tener al menos ${field.minLength} caracteres`,
          code: 'MIN_LENGTH'
        });
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors.push({
          field: field.key,
          message: `${field.label} no puede exceder ${field.maxLength} caracteres`,
          code: 'MAX_LENGTH'
        });
      }
    }

    // Validación numérica
    if (field.type === 'number' && value !== null && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push({
          field: field.key,
          message: `${field.label} debe ser un número válido`,
          code: 'INVALID_NUMBER'
        });
      } else {
        if (field.min !== undefined && numValue < field.min) {
          errors.push({
            field: field.key,
            message: `${field.label} debe ser mayor o igual a ${field.min}`,
            code: 'MIN_VALUE'
          });
        }
        if (field.max !== undefined && numValue > field.max) {
          errors.push({
            field: field.key,
            message: `${field.label} debe ser menor o igual a ${field.max}`,
            code: 'MAX_VALUE'
          });
        }
      }
    }

    // Validación de email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: field.key,
          message: `${field.label} debe ser un email válido`,
          code: 'INVALID_EMAIL'
        });
      }
    }

    return errors;
  }

  /**
   * MÉTODOS DE UTILIDAD
   */

  getRequiredDocumentsForTramiteStep(tramiteId: number, step: string, token: string): Observable<DocumentTemplateDto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-templates`,
      { params: new HttpParams().set('step', step) ,  headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  checkDocumentCompleteness(tramiteId: number, token: string): Observable<{completed: boolean, missing: string[]}> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{completed: boolean, missing: string[]}>(
      `${this.apiUrl}/tramites/${tramiteId}/document-completeness`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private refreshDocuments(tramiteId: number): void {
    this.getDocumentInstancesForTramite(tramiteId).subscribe();
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en DocumentService:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de documentos'));
  }

  cargarDocumento(docId: string, file: File, token: string, producto: Producto) {

    console.log('🚀 Iniciando carga de documento:', { docId, file, producto });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const payload = this.decodeToken(token);
    const username = payload?.preferred_username;
    if (!username) {
      console.error('❌ No se pudo obtener el username del token');
      return of(null);
    }

    // 🚀 Comenzamos el flujo de peticiones
    return this.http.get<any>(`${this.apiUrl}/usuarios/username/${username}`, { headers }).pipe(

      // 2️⃣ Con el id del usuario, pedimos su empresa
      switchMap((usuario) => {
        const usuarioId = usuario.id;
        console.log(`🔑 Usuario ID obtenido: ${usuarioId}`);
        return this.http.get<any>(`${this.apiUrl}/usuarios/${usuarioId}/empresa`, { headers });
      }),

      // 3️⃣ Con los datos de la empresa, pedimos la signed URL
      switchMap((empresa) => {
        const requestBody = {
          bucketName: 'segar-documents',
          objectName: `${empresa.razonSocial}/${producto.nombre}/${docId}/${file.name}`,
          contentType: file.type
        };
        console.log('📄 Solicitando signed URL con body:', requestBody);
        return this.http.post(`${this.apiUrl}/documentos/signed-url`, requestBody, {
          headers,
          responseType: 'text'
        });
      }),

      // 4️⃣ Subir el archivo a GCS con la signed URL
      switchMap((signedUrl: string) =>
        from(
          fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
          }).then((response) => {
            if (!response.ok) throw new Error('❌ Error al subir el archivo a GCS');
            return file.name;
          })
        )
      ),

      // ✅ Éxito
      tap((nombreArchivo) => {
        console.log(`✅ Archivo ${nombreArchivo} subido correctamente`);
      }),

      // ❌ Error global
      catchError((error) => {
        console.error('❌ Error en la cadena de peticiones:', error);
        return of(null);
      })
    );
  }

  private decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      return JSON.parse(payloadDecoded);
    } catch {
      console.error('Error al decodificar el token');
      return null;
    }
  }

  getSignedUrl(bucketName: string, objectName: string, contentType: string, token: string): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const requestBody = {
      bucketName,
      objectName,
      contentType
    };

    return this.http.post<string>(
      `${this.apiUrl}/documentos/get-signed-url`,
      requestBody,
      {
        headers,
        responseType: 'text' as 'json'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
