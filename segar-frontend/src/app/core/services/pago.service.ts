import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PagoBackend {
  id: number;
  numeroTransaccion: string;
  monto: number;
  moneda: 'COP';
  estado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  metodoPago: 'TARJETA_CREDITO' | 'PSE' | 'TRANSFERENCIA';
  fechaPago: string;
  descripcion: string;
  empresaId: number;
  tramiteId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly baseUrl = 'http://35.238.19.224:8090/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene pagos por estado (principalmente APROBADO para registro)
   */
  getPagosPorEstado(estado: string): Observable<PagoBackend[]> {
    return this.http.get<PagoBackend[]>(`${this.baseUrl}/pagos/estado/${estado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un pago específico por ID
   */
  getPago(id: number): Observable<PagoBackend> {
    return this.http.get<PagoBackend>(`${this.baseUrl}/pagos/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Procesa un nuevo pago
   */
  procesarPago(pago: Omit<PagoBackend, 'id'>): Observable<PagoBackend> {
    return this.http.post<PagoBackend>(`${this.baseUrl}/pagos`, pago)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todos los pagos
   */
  getAllPagos(): Observable<PagoBackend[]> {
    return this.http.get<PagoBackend[]>(`${this.baseUrl}/pagos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Maneja los errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en PagoService:', error);
    let errorMessage = 'Ocurrió un error inesperado en el servicio de pagos';

    if (error.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tu autenticación.';
    } else if (error.status === 404) {
      errorMessage = 'Pago no encontrado.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor de pagos.';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
