import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaces que coinciden con el backend
 */
export interface DocumentTemplateDTO {
  id: number;
  code: string;
  name: string;
  description: string;
  fieldsDefinition: string; // JSON string con campos del formulario
  fileRules: string; // JSON string con reglas de archivos
  appliesToTramiteTypes: string[]; // REGISTRO, RENOVACION, MODIFICACION
  categoriaRiesgo: string; // I, IIA, III (Enums del backend)
  required: boolean;
  version: number; // Cambiado de string a number
  active: boolean;
  orden: number; // ✅ NUEVO: Campo agregado por el backend
  category: string; // ✅ NUEVO: basico, analisis, certificacion, estudios, otros
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldDefinition {
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file' | 'checkbox';
  requerido: boolean;
  opciones?: string[];
  placeholder?: string;
  descripcion?: string;
  validacion?: {
    min?: number;
    max?: number;
    pattern?: string;
    mensaje?: string;
  };
}

export interface FileRules {
  maxSize: number; // en bytes
  allowedTypes: string[]; // ['PDF', 'JPG', 'PNG']
  required: boolean;
}

/**
 * Servicio para gestionar plantillas de documentos del backend
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentTemplateService {
  private readonly baseUrl = `${environment.apiUrl}/api/document-templates`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las plantillas activas
   */
  getAllTemplates(): Observable<DocumentTemplateDTO[]> {
    return this.http.get<DocumentTemplateDTO[]>(this.baseUrl);
  }

  /**
   * Obtiene una plantilla por ID
   */
  getTemplateById(id: number): Observable<DocumentTemplateDTO> {
    return this.http.get<DocumentTemplateDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene plantillas para un tipo de trámite específico
   * @param tipoTramite REGISTRO, RENOVACION, MODIFICACION
   */
  getTemplatesByTramite(tipoTramite: string): Observable<DocumentTemplateDTO[]> {
    return this.http.get<DocumentTemplateDTO[]>(`${this.baseUrl}/by-tramite/${tipoTramite}`);
  }

  /**
   * Obtiene plantillas filtradas por trámite Y categoría de riesgo
   * @param tipoTramite REGISTRO, RENOVACION, MODIFICACION
   * @param categoriaRiesgo I, IIA, III (Enums del backend)
   */
  getTemplatesByTramiteAndRiesgo(tipoTramite: string, categoriaRiesgo: string, token: string): Observable<DocumentTemplateDTO[]> {
    const params = new HttpParams()
      .set('tipoTramite', tipoTramite)
      .set('categoriaRiesgo', categoriaRiesgo);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.baseUrl}/by-tramite-riesgo`;
    console.log(`🌐 Llamando al backend: ${url}?tipoTramite=${tipoTramite}&categoriaRiesgo=${categoriaRiesgo}`);

    return this.http.get<DocumentTemplateDTO[]>(url, { params , headers }).pipe(
      tap(response => {
        console.log(`✅ Respuesta del backend: ${response.length} plantillas recibidas`, response);
      }),
      catchError(error => {
        console.error('❌ Error en getTemplatesByTramiteAndRiesgo:', error);
        console.error('❌ URL:', url);
        console.error('❌ Params:', { tipoTramite, categoriaRiesgo });
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ Error completo:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene solo plantillas OBLIGATORIAS para un tipo de trámite
   */
  getRequiredTemplatesByTramite(tipoTramite: string): Observable<DocumentTemplateDTO[]> {
    return this.http.get<DocumentTemplateDTO[]>(`${this.baseUrl}/required-by-tramite/${tipoTramite}`);
  }

  /**
   * Parsea el JSON de fieldsDefinition a objetos tipados
   */
  parseFieldsDefinition(fieldsJson: string): FieldDefinition[] {
    try {
      return JSON.parse(fieldsJson);
    } catch (error) {
      console.error('Error parseando fieldsDefinition:', error);
      return [];
    }
  }

  /**
   * Parsea el JSON de fileRules a objeto tipado
   */
  parseFileRules(rulesJson: string): FileRules {
    try {
      return JSON.parse(rulesJson);
    } catch (error) {
      console.error('Error parseando fileRules:', error);
      return { maxSize: 10485760, allowedTypes: ['PDF'], required: false };
    }
  }

  /**
   * Determina el tipo de trámite según el nivel de riesgo
   * NSO = Notificación Sanitaria Obligatoria (Bajo)
   * PSA = Permiso Sanitario (Medio)
   * RSA = Registro Sanitario (Alto)
   */
  mapRiesgoToTramite(nivelRiesgo: 'bajo' | 'medio' | 'alto'): string {
    const mapping: { [key: string]: string } = {
      'bajo': 'NSO',
      'medio': 'PSA',
      'alto': 'RSA'
    };
    return mapping[nivelRiesgo] || 'NSO';
  }

  /**
   * Mapea el nivel de riesgo del frontend (bajo, medio, alto)
   * al enum del backend (I, IIA, III)
   *
   * Según la normativa INVIMA:
   * - BAJO (Riesgo I): Productos de bajo riesgo sanitario
   * - MEDIO (Riesgo IIA): Productos de riesgo sanitario medio
   * - ALTO (Riesgo III): Productos de alto riesgo sanitario
   */
  mapRiesgoToBackendEnum(nivelRiesgo: 'bajo' | 'medio' | 'alto'): string {
    const mapping: { [key: string]: string } = {
      'bajo': 'I',
      'medio': 'IIA',
      'alto': 'III'
    };
    return mapping[nivelRiesgo] || 'I';
  }

  /**
   * Convierte DocumentTemplateDTO del backend al formato esperado por el frontend
   */
  convertToDocumentoRequerido(template: DocumentTemplateDTO): DocumentoRequeridoFrontend {
    const fields = this.parseFieldsDefinition(template.fieldsDefinition);
    const fileRules = this.parseFileRules(template.fileRules);

    return {
      id: template.code,
      templateId: template.id,
      nombre: template.name,
      tipo: fileRules.required ? 'externo' : 'autogenerado',
      formato: this.determinarFormato(fileRules.allowedTypes),
      descripcion: template.description,
      campos: fields.map(f => ({
        nombre: f.nombre,
        tipo: f.tipo,
        requerido: f.requerido,
        opciones: f.opciones,
        placeholder: f.placeholder,
        descripcion: f.descripcion
      })),
      obligatorio: template.required,
      orden: template.orden || 999, // ✅ Usar campo orden del backend
      categoria: (template.category || this.determinarCategoria(template.code)) as 'basico' | 'analisis' | 'certificacion' | 'estudios' | 'otros',
      icono: this.determinarIcono(template.code)
    };
  }

  private determinarFormato(allowedTypes: string[]): 'PDF' | 'JSON' | 'IMAGE' | 'MULTI' {
    if (allowedTypes.includes('PDF')) return 'PDF';
    if (allowedTypes.includes('JPG') || allowedTypes.includes('PNG')) return 'IMAGE';
    if (allowedTypes.length > 1) return 'MULTI';
    return 'PDF';
  }

  private determinarCategoria(code: string): 'basico' | 'analisis' | 'certificacion' | 'estudios' | 'otros' {
    const lowerCode = code.toLowerCase();
    if (lowerCode.includes('analisis') || lowerCode.includes('microbiologico') || lowerCode.includes('fisicoquimico')) {
      return 'analisis';
    }
    if (lowerCode.includes('certificado') || lowerCode.includes('bpm') || lowerCode.includes('haccp')) {
      return 'certificacion';
    }
    if (lowerCode.includes('estudio') || lowerCode.includes('estabilidad')) {
      return 'estudios';
    }
    if (lowerCode.includes('ficha') || lowerCode.includes('etiqueta') || lowerCode.includes('certificado_existencia')) {
      return 'basico';
    }
    return 'otros';
  }

  private determinarIcono(code: string): string {
    const iconMap: { [key: string]: string } = {
      'certificado_existencia': 'building',
      'ficha_tecnica': 'file-alt',
      'etiqueta': 'tags',
      'comprobante_pago': 'receipt',
      'analisis_fisicoquimico': 'flask',
      'analisis_microbiologico': 'microscope',
      'certificacion_bpm': 'certificate',
      'certificacion_haccp': 'shield-alt',
      'estudios_estabilidad': 'chart-line'
    };
    return iconMap[code.toLowerCase()] || 'file';
  }
}

/**
 * Interface para mantener compatibilidad con el frontend actual
 */
export interface DocumentoRequeridoFrontend {
  id: string;
  templateId: number;
  nombre: string;
  tipo: 'autogenerado' | 'externo';
  formato: 'PDF' | 'JSON' | 'IMAGE' | 'MULTI';
  descripcion: string;
  campos: CampoDocumentoFrontend[];
  obligatorio: boolean;
  orden: number;
  categoria: 'basico' | 'analisis' | 'certificacion' | 'estudios' | 'otros';
  icono?: string;
}

export interface CampoDocumentoFrontend {
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file' | 'checkbox';
  requerido: boolean;
  opciones?: string[];
  placeholder?: string;
  descripcion?: string;
}
