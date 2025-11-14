import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para la integración con el backend de radicación
export interface RadicacionRequest {
  empresaId: number;
  productoId: number;
  tipoTramite: string;
  documentosId: number[];
  pagoId: number;
  observaciones?: string;
}

export interface SolicitudRadicadaResponse {
  numeroRadicado: string;
  estado: string;
  fechaRadicacion: Date;
  empresaId: number;
  productoId: number;
  tipoTramite: string;
  mensaje: string;
}

export interface ValidacionesResponse {
  empresaRegistrada: boolean;
  documentosCargados: boolean;
  pagosAprobados: boolean;
  puedeRadicar: boolean;
  cantidadDocumentos: number;
  cantidadPagos: number;
  mensaje?: string;
}

export interface SolicitudResponse {
  id: number;
  numeroRadicado: string;
  estado: string;
  fechaRadicacion: Date;
  empresaId: number;
  productoId: number;
  tipoTramite: string;
}

@Injectable({
  providedIn: 'root'
})
export class RadicacionService {
  private apiUrl = `${environment.apiUrl}/api/radicacion`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Valida los pre-requisitos para radicación
   * GET /api/radicacion/validaciones/{empresaId}
   */
  validarPreRequisitos(empresaId: number): Observable<ValidacionesResponse> {
    return this.http.get<ValidacionesResponse>(`${this.apiUrl}/validaciones/${empresaId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Radica una solicitud ante INVIMA
   * POST /api/radicacion/solicitud
   */
  radicarSolicitud(solicitudData: RadicacionRequest): Observable<SolicitudRadicadaResponse> {
    return this.http.post<SolicitudRadicadaResponse>(`${this.apiUrl}/solicitud`, solicitudData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Consultar solicitudes radicadas
   * GET /api/radicacion/estado/{empresaId}
   */
  obtenerSolicitudesRadicadas(empresaId: number): Observable<SolicitudResponse[]> {
    return this.http.get<SolicitudResponse[]>(
      `${this.apiUrl}/estado/${empresaId}`,
      this.httpOptions
    );
  }

  /**
   * Buscar por número de radicado
   * GET /api/radicacion/consulta/{numeroRadicado}
   */
  consultarPorRadicado(numeroRadicado: string): Observable<SolicitudResponse> {
    return this.http.get<SolicitudResponse>(
      `${this.apiUrl}/consulta/${numeroRadicado}`,
      this.httpOptions
    );
  }

  /**
   * Manejar errores de las peticiones HTTP
   */
  private handleError(error: any): Observable<never> {
    // Aquí puedes manejar el error de la manera que necesites
    console.error('Ocurrió un error:', error);
    throw error;
  }
}
