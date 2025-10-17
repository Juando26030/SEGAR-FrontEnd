import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * DTOs que coinciden con el backend
 */
export interface DocumentInstanceDTO {
  id?: number;
  templateId: number;
  tramiteId: number;
  filledData: string; // JSON string con datos del formulario
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
  uploadedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CreateDocumentInstanceRequest {
  templateId: number;
  filledData: string; // JSON object serializado
  status: 'DRAFT' | 'SUBMITTED';
}

export interface UpdateDocumentInstanceRequest {
  filledData?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

/**
 * Servicio para gestionar instancias de documentos de trámites
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentInstanceService {
  private readonly baseUrl = 'http://localhost:8090';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las instancias de documentos de un trámite
   */
  getDocumentsByTramite(tramiteId: number): Observable<DocumentInstanceDTO[]> {
    return this.http.get<DocumentInstanceDTO[]>(
      `${this.baseUrl}/api/tramites/${tramiteId}/document-instances`
    );
  }

  /**
   * Obtiene una instancia específica de documento
   */
  getDocumentById(tramiteId: number, documentId: number): Observable<DocumentInstanceDTO> {
    return this.http.get<DocumentInstanceDTO>(
      `${this.baseUrl}/api/tramites/${tramiteId}/document-instances/${documentId}`
    );
  }

  /**
   * Crea una nueva instancia de documento
   */
  createDocument(tramiteId: number, request: CreateDocumentInstanceRequest): Observable<DocumentInstanceDTO> {
    return this.http.post<DocumentInstanceDTO>(
      `${this.baseUrl}/api/tramites/${tramiteId}/document-instances`,
      request
    );
  }

  /**
   * Actualiza una instancia de documento existente
   */
  updateDocument(
    tramiteId: number,
    documentId: number,
    request: UpdateDocumentInstanceRequest
  ): Observable<DocumentInstanceDTO> {
    return this.http.put<DocumentInstanceDTO>(
      `${this.baseUrl}/api/tramites/${tramiteId}/document-instances/${documentId}`,
      request
    );
  }

  /**
   * Sube archivos adjuntos a un documento
   */
  uploadFiles(tramiteId: number, documentId: number, files: File[]): Observable<DocumentInstanceDTO> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<DocumentInstanceDTO>(
      `${this.baseUrl}/api/tramites/${tramiteId}/document-instances/${documentId}/upload`,
      formData
    );
  }

  /**
   * Guarda un documento en borrador
   */
  saveDraft(tramiteId: number, templateId: number, data: any): Observable<DocumentInstanceDTO> {
    return this.createDocument(tramiteId, {
      templateId,
      filledData: JSON.stringify(data),
      status: 'DRAFT'
    });
  }

  /**
   * Marca un documento como enviado
   */
  submitDocument(tramiteId: number, documentId: number, data: any): Observable<DocumentInstanceDTO> {
    return this.updateDocument(tramiteId, documentId, {
      filledData: JSON.stringify(data),
      status: 'SUBMITTED'
    });
  }

  /**
   * Verifica si todos los documentos obligatorios están completados
   */
  checkCompleteness(documents: DocumentInstanceDTO[], requiredTemplateIds: number[]): boolean {
    const submittedTemplates = documents
      .filter(doc => doc.status === 'SUBMITTED' || doc.status === 'APPROVED')
      .map(doc => doc.templateId);

    return requiredTemplateIds.every(id => submittedTemplates.includes(id));
  }

  /**
   * Calcula el progreso de completitud de documentos
   */
  calculateProgress(documents: DocumentInstanceDTO[], totalRequired: number): number {
    if (totalRequired === 0) return 100;

    const completed = documents.filter(
      doc => doc.status === 'SUBMITTED' || doc.status === 'APPROVED'
    ).length;

    return Math.round((completed / totalRequired) * 100);
  }

  /**
   * Parsea filledData de JSON string a objeto
   */
  parseFilledData(filledData: string): any {
    try {
      return JSON.parse(filledData);
    } catch (error) {
      console.error('Error parseando filledData:', error);
      return {};
    }
  }
}
