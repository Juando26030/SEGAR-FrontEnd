import { DocumentTemplateDto, DocumentStatus } from './document-template.dto';

// Re-exportar DocumentStatus para que esté disponible desde este módulo
export { DocumentStatus } from './document-template.dto';

/**
 * DTO para instancias de documentos dinámicos
 * Extiende la funcionalidad del DocumentoDto existente
 */
export interface DocumentInstanceDto {
  id: number;
  templateId: number;
  template?: DocumentTemplateDto;
  tramiteId: number;
  empresaId: number;
  status: DocumentStatus;
  filledData: Record<string, any>;
  fileUrl?: string;
  fileMime?: string;
  fileSize?: number;
  storageKey?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Campos adicionales para el frontend
  uploadProgress?: number;
  validationErrors?: ValidationError[];
  isDirty?: boolean;
  isProcessing?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CreateDocumentInstanceDto {
  templateId: number;
  tramiteId: number;
  filledData: Record<string, any>;
}

export interface UpdateDocumentInstanceDto {
  filledData?: Record<string, any>;
  status?: DocumentStatus;
}

export interface FileUploadDto {
  file: File;
  metadata?: Record<string, any>;
}

export interface ExportPdfDto {
  outputFormat?: 'pdf';
  includeEmbeddedFiles?: boolean;
  template?: string; // Para especificar template de PDF personalizado
}

export interface ExportPdfResponseDto {
  fileUrl: string;
  size: number;
  storageKey: string;
  generatedAt: Date;
}

/**
 * DTO para compatibilidad con la entidad Documento existente
 * Mantiene retrocompatibilidad mientras migra gradualmente
 */
export interface DocumentoExtendedDto {
  // Campos originales del DocumentoDto
  idDocumento: number;
  nombre: string;
  version: string;
  tipo: string;
  urlNube: string;
  idTramite: number;
  aprobado: boolean;
  comentarios: string;
  archivo?: File;
  estado?: 'pendiente' | 'completado' | 'error';
  obligatorio?: boolean;
  tamano?: string;
  fechaSubida?: Date;

  // Nuevos campos para documentos dinámicos
  templateId?: number;
  instanceId?: number;
  metadata?: Record<string, any>;
  storageKey?: string;
  dynamicFields?: Record<string, any>;
}
