import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Solicitud,
  RadicacionSolicitudDTO,
  RadicacionResponse,
  EstadoSolicitud,
  TipoTramite,
  ErrorResponse
} from '../DTOs/solicitud.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private readonly baseUrl = `${environment.apiUrl}/api/solicitudes`;

  constructor(private http: HttpClient) {}

  /**
   * Radica una nueva solicitud en el sistema
   */
  radicarSolicitud(radicacionDTO: RadicacionSolicitudDTO): Observable<RadicacionResponse> {
    return this.http.post<RadicacionResponse>(`${this.baseUrl}/radicacion`, radicacionDTO)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca solicitudes por ID de empresa
   */
  buscarSolicitudesPorEmpresa(empresaId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/empresa/${empresaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca solicitudes por estado
   */
  buscarSolicitudesPorEstado(estado: EstadoSolicitud): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/estado/${estado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca una solicitud por número de radicado
   */
  buscarPorRadicado(numeroRadicado: string): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/radicado/${numeroRadicado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una solicitud por ID
   */
  obtenerSolicitud(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todas las solicitudes
   */
  obtenerTodasLasSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Maneja los errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error && typeof error.error === 'object') {
      const backendError = error.error as ErrorResponse;
      switch (backendError.codigo) {
        case 'DOCUMENTOS_INCOMPLETOS':
          errorMessage = `Documentos incompletos: ${backendError.mensaje}`;
          break;
        case 'PAGO_INVALIDO':
          errorMessage = `Pago inválido: ${backendError.mensaje}`;
          break;
        case 'SOLICITUD_DUPLICADA':
          errorMessage = `Solicitud duplicada: ${backendError.mensaje}`;
          break;
        case 'ERROR_INTERNO':
          errorMessage = `Error interno: ${backendError.mensaje}`;
          break;
        default:
          errorMessage = backendError.mensaje || 'Error en el servidor';
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Error en la solicitud. Verifique los datos ingresados.';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
    }

    console.error('Error en SolicitudService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
