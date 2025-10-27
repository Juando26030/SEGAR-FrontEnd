import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto, Documento, Pago, TipoDocumento, EstadoPago } from '../DTOs/solicitud.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoDocumentoService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos disponibles
   */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un producto por ID
   */
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene documentos por solicitud ID
   */
  obtenerDocumentos(solicitudId: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.baseUrl}/documentos/solicitud/${solicitudId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todos los documentos disponibles para un trámite
   */
  obtenerDocumentosDisponibles(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.baseUrl}/documentos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un documento específico existe para una solicitud
   */
  verificarDocumento(solicitudId: number, tipoDocumento: TipoDocumento): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/documentos/verificar/${solicitudId}/${tipoDocumento}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene información de un pago por ID
   */
  obtenerPago(pagoId: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.baseUrl}/pagos/${pagoId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene pagos por solicitud
   */
  obtenerPagosPorSolicitud(solicitudId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/pagos/solicitud/${solicitudId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si existe un pago aprobado para una solicitud
   */
  verificarPagoAprobado(solicitudId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/pagos/verificar-aprobado/${solicitudId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todos los pagos disponibles (para testing)
   */
  obtenerTodosLosPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/pagos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud inválida';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error('ProductoDocumentoService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
