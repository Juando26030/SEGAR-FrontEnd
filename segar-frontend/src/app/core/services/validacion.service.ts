import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ValidacionEmpresaResponse {
  empresaId: number;
  registrada: boolean;
  estado: 'ACTIVA' | 'INACTIVA';
  mensaje: string;
}

export interface ValidacionDocumentosRequest {
  empresaId: number;
  documentosId: number[];
}

export interface ValidacionDocumentosResponse {
  empresaId: number;
  documentosCompletos: boolean;
  totalDocumentos: number;
  documentosFaltantes: string[];
  mensaje: string;
}

export interface ValidacionPagoResponse {
  pagoId: number;
  pagoValido: boolean;
  estado: 'APROBADO' | 'NO_ENCONTRADO';
  monto: number;
  mensaje: string;
}

export interface ValidacionCompletaRequest {
  empresaId: number;
  documentosId: number[];
  pagoId: number;
}

export interface ValidacionCompletaResponse {
  puedeRadicar: boolean;
  validaciones: {
    empresa: { valida: boolean; mensaje: string };
    documentos: { completos: boolean; mensaje: string };
    pago: { valido: boolean; mensaje: string };
  };
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidacionService {
  private readonly baseUrl = 'http://localhost:8090/api/validaciones';

  constructor(private http: HttpClient) {}

  /**
   * Validar que la empresa esté registrada y activa
   */
  validarEmpresa(empresaId: number): Observable<ValidacionEmpresaResponse> {
    return this.http.get<ValidacionEmpresaResponse>(`${this.baseUrl}/empresa/${empresaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validar que todos los documentos obligatorios estén presentes
   */
  validarDocumentos(request: ValidacionDocumentosRequest): Observable<ValidacionDocumentosResponse> {
    return this.http.post<ValidacionDocumentosResponse>(`${this.baseUrl}/documentos`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validar que el pago esté aprobado
   */
  validarPago(pagoId: number): Observable<ValidacionPagoResponse> {
    return this.http.get<ValidacionPagoResponse>(`${this.baseUrl}/pago/${pagoId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Ejecutar validación completa previa a la radicación
   */
  validacionCompleta(request: ValidacionCompletaRequest): Observable<ValidacionCompletaResponse> {
    return this.http.post<ValidacionCompletaResponse>(`${this.baseUrl}/completa`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en ValidacionService:', error);
    let errorMessage = 'Ocurrió un error inesperado en el servicio de validaciones';

    if (error.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tu autenticación.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado para validación.';
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos para la validación.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor de validaciones.';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
