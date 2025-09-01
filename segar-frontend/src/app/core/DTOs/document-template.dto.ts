/**
 * DTO para plantillas de documentos dinámicos según especificaciones INVIMA
 * Basado en InvimÁgil y formatos oficiales ASS-RSA-FM099
 */

export interface DocumentTemplateDto {
  id: number;
  code: string;
  name: string;
  description: string;
  fieldsDefinition: DocumentFieldDefinition[];
  fileRules: FileRules;
  appliesToTramiteTypes: TramiteType[];
  version: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  uiHints?: UiHints;
}

export interface DocumentFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  options?: FieldOption[];
  validations?: ValidationRule[];
  placeholder?: string;
  helpText?: string;
  dependsOn?: string;
  conditionalLogic?: ConditionalLogic; // Agregar propiedad faltante
  columns?: TableColumn[]; // Para campos tipo tabla
  allowedMime?: string[]; // Para campos tipo file
  maxSize?: number; // Para campos tipo file
  multiple?: boolean; // Para campos tipo file o select
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  options?: FieldOption[];
}

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface ConditionalLogic {
  condition: string; // Expresión condicional, ej: "field1 === 'value'"
  action: 'show' | 'hide' | 'require' | 'disable';
  dependsOn: string[]; // Campos de los que depende
}

export interface FileRules {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  multipleAllowed: boolean;
  maxFiles?: number;
}

export interface UiHints {
  layout: 'single-column' | 'two-columns' | 'grid';
  showProgress?: boolean;
  collapsibleSections?: string[];
  sectionsOrder?: string[];
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'table'
  | 'section-header';

export enum TramiteType {
  REGISTRO = 'REGISTRO',
  RENOVACION = 'RENOVACION',
  MODIFICACION = 'MODIFICACION',
  NOTIFICACION = 'NOTIFICACION',
  CANCELACION = 'CANCELACION'
}

export type DocumentStatus =
  | 'DRAFT'
  | 'FILLED'
  | 'UPLOADED'
  | 'VERIFIED'
  | 'FINALIZED'
  | 'REJECTED';

/**
 * Códigos de documentos basados en requisitos INVIMA
 */
export enum DocumentCode {
  FORMULARIO_SOLICITUD = 'FORMULARIO_SOLICITUD',
  CERTIFICADO_EXISTENCIA = 'CERTIFICADO_EXISTENCIA',
  PODER_REPRESENTACION = 'PODER_REPRESENTACION',
  COMPROBANTE_PAGO = 'COMPROBANTE_PAGO',
  FICHA_TECNICA = 'FICHA_TECNICA',
  ETIQUETA_ROTULADO = 'ETIQUETA_ROTULADO',
  CERTIFICADO_ANALISIS = 'CERTIFICADO_ANALISIS',
  CERTIFICADO_BPM = 'CERTIFICADO_BPM',
  CERTIFICADO_VENTA_LIBRE = 'CERTIFICADO_VENTA_LIBRE',
  RESPUESTA_REQUERIMIENTO = 'RESPUESTA_REQUERIMIENTO',
  RESOLUCION_FINAL = 'RESOLUCION_FINAL',
  REGISTRO_SANITARIO = 'REGISTRO_SANITARIO'
}
