import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { List } from 'postcss/lib/list';
import { DocumentoDto } from '../DTOs/documento.dto';

export interface DocumentoDisponible {
  id: number;
  nombre: string;
  tipo: 'IDENTIFICACION' | 'TRIBUTARIO' | 'LEGAL' | 'FINANCIERO' | 'TECNICO';
  requerido: boolean;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los documentos disponibles
   */
  getDocumentosDisponibles(): Observable<DocumentoDisponible[]> {
    return this.http.get<DocumentoDisponible[]>(`${this.baseUrl}/documentos/disponibles`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un documento por ID
   */
  getDocumento(id: number): Observable<DocumentoDisponible> {
    return this.http.get<DocumentoDisponible>(`${this.baseUrl}/documentos/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Maneja los errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en DocumentoService:', error);
    let errorMessage = 'Ocurrió un error inesperado en el servicio de documentos';

    if (error.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tu autenticación.';
    } else if (error.status === 404) {
      errorMessage = 'Documentos no encontrados.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor de documentos.';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
    }

    return throwError(() => new Error(errorMessage));
  }

  getDocumentoPorTramite(tramiteId: number): Observable<DocumentoDto[]> {
    return this.http.get<DocumentoDto[]>(`${this.baseUrl}/documentos/tramite/${tramiteId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
