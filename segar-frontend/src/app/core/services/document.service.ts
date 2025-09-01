import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiUrl = '/api'; // Configurar según environment
  private documentsSubject = new BehaviorSubject<DocumentInstanceDto[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * ENDPOINTS DE PLANTILLAS
   */

  getDocumentTemplates(tramiteType?: TramiteType): Observable<DocumentTemplateDto[]> {
    let params = new HttpParams();
    if (tramiteType) {
      params = params.set('tramiteType', tramiteType);
    }

    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/document-templates`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentTemplate(id: number): Observable<DocumentTemplateDto> {
    return this.http.get<DocumentTemplateDto>(
      `${this.apiUrl}/document-templates/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createDocumentTemplate(template: Partial<DocumentTemplateDto>): Observable<DocumentTemplateDto> {
    return this.http.post<DocumentTemplateDto>(
      `${this.apiUrl}/document-templates`,
      template
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateDocumentTemplate(id: number, template: Partial<DocumentTemplateDto>): Observable<DocumentTemplateDto> {
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

  getDocumentTemplatesForTramite(tramiteId: number): Observable<DocumentTemplateDto[]> {
    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-templates`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentInstancesForTramite(tramiteId: number): Observable<DocumentInstanceDto[]> {
    return this.http.get<DocumentInstanceDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances`
    ).pipe(
      tap(instances => this.documentsSubject.next(instances)),
      catchError(this.handleError)
    );
  }

  getDocumentInstance(tramiteId: number, instanceId: number): Observable<DocumentInstanceDto> {
    return this.http.get<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createDocumentInstance(tramiteId: number, instance: CreateDocumentInstanceDto): Observable<DocumentInstanceDto> {
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
    instance: UpdateDocumentInstanceDto
  ): Observable<DocumentInstanceDto> {
    return this.http.put<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}`,
      instance
    ).pipe(
      tap(() => this.refreshDocuments(tramiteId)),
      catchError(this.handleError)
    );
  }

  /**
   * MANEJO DE ARCHIVOS
   */

  uploadFile(tramiteId: number, instanceId: number, fileData: FileUploadDto): Observable<DocumentInstanceDto> {
    const formData = new FormData();
    formData.append('file', fileData.file);
    if (fileData.description) {
      formData.append('description', fileData.description);
    }

    return this.http.post<DocumentInstanceDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/upload`,
      formData
    ).pipe(
      tap(() => this.refreshDocuments(tramiteId)),
      catchError(this.handleError)
    );
  }

  /**
   * EXPORTACIÓN A PDF
   */

  exportToPdf(tramiteId: number, instanceId: number, options: ExportPdfDto = {}): Observable<ExportPdfResponseDto> {
    return this.http.post<ExportPdfResponseDto>(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/export-pdf`,
      options
    ).pipe(
      catchError(this.handleError)
    );
  }

  downloadDocument(tramiteId: number, instanceId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/tramites/${tramiteId}/document-instances/${instanceId}/download`,
      { responseType: 'blob' }
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

  getRequiredDocumentsForTramiteStep(tramiteId: number, step: string): Observable<DocumentTemplateDto[]> {
    return this.http.get<DocumentTemplateDto[]>(
      `${this.apiUrl}/tramites/${tramiteId}/document-templates`,
      { params: new HttpParams().set('step', step) }
    ).pipe(
      catchError(this.handleError)
    );
  }

  checkDocumentCompleteness(tramiteId: number): Observable<{completed: boolean, missing: string[]}> {
    return this.http.get<{completed: boolean, missing: string[]}>(
      `${this.apiUrl}/tramites/${tramiteId}/document-completeness`
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
}
