import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces para Resolución y Cumplimiento
export interface Resolucion {
  id: number;
  numeroResolucion: string;
  fechaEmision: Date;
  autoridad: string;
  estado: 'APROBADA' | 'RECHAZADA' | 'EN_REVISION';
  observaciones: string;
  tramiteId: number;
  documentoUrl?: string;
  fechaNotificacion: Date;
}

export interface RegistroSanitario {
  id: number;
  numeroRegistro: string;
  fechaExpedicion: Date;
  fechaVencimiento: Date;
  productoId: number;
  empresaId: number;
  estado: 'VIGENTE' | 'VENCIDO' | 'SUSPENDIDO';
  resolucionId: number;
  documentoUrl: string;
}

export interface HistorialTramite {
  id: number;
  tramiteId: number;
  fecha: Date;
  accion: string;
  descripcion: string;
  usuario: string;
  estado: string;
}

export interface TramiteCompleto {
  id: number;
  numeroRadicado: string;
  estado: 'RADICADA' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'FINALIZADA';
  fechaCreacion: Date;
  empresaId: number;
  productoId: number;
  resolucion?: Resolucion;
  registroSanitario?: RegistroSanitario;
  historial: HistorialTramite[];
}

@Injectable({
  providedIn: 'root'
})
export class ResolucionService {
  private apiUrl = 'http://localhost:8090/api/tramites';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtener la resolución de un trámite
   * GET /tramites/{id}/resolucion
   */
  obtenerResolucion(tramiteId: number): Observable<Resolucion> {
    return this.http.get<Resolucion>(`${this.apiUrl}/${tramiteId}/resolucion`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener el registro sanitario (solo si está aprobado)
   * GET /tramites/{id}/registro
   */
  obtenerRegistroSanitario(tramiteId: number): Observable<RegistroSanitario> {
    return this.http.get<RegistroSanitario>(`${this.apiUrl}/${tramiteId}/registro`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener información completa del trámite con resolución
   * GET /tramites/{id}/completo
   */
  obtenerTramiteCompleto(tramiteId: number): Observable<TramiteCompleto> {
    return this.http.get<TramiteCompleto>(`${this.apiUrl}/${tramiteId}/completo`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener historial del trámite
   * GET /tramites/{id}/historial
   */
  obtenerHistorial(tramiteId: number): Observable<HistorialTramite[]> {
    return this.http.get<HistorialTramite[]>(`${this.apiUrl}/${tramiteId}/historial`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Descargar documento de resolución
   * GET /tramites/{id}/resolucion/descargar
   */
  descargarResolucion(tramiteId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${tramiteId}/resolucion/descargar`, {
      responseType: 'blob',
      headers: this.httpOptions.headers
    }).pipe(catchError(this.handleError));
  }

  /**
   * Descargar registro sanitario
   * GET /tramites/{id}/registro/descargar
   */
  descargarRegistroSanitario(tramiteId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${tramiteId}/registro/descargar`, {
      responseType: 'blob',
      headers: this.httpOptions.headers
    }).pipe(catchError(this.handleError));
  }

  /**
   * Marcar trámite como finalizado
   * POST /tramites/{id}/finalizar
   */
  finalizarTramite(tramiteId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${tramiteId}/finalizar`, {}, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejar errores de las peticiones HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 404:
          errorMessage = 'Resolución no encontrada';
          break;
        case 403:
          errorMessage = 'No tiene permisos para acceder a esta resolución';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en ResolucionService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
