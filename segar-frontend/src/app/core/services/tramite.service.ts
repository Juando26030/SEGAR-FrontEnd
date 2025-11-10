import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TramiteDto } from '../DTOs/tramite.dto';

@Injectable({
  providedIn: 'root'
})
export class TramiteService {
  private readonly baseUrl = `${environment.apiUrl}/api/tramites`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los tramites disponibles
   */
  getAllTramites(): Observable<TramiteDto[]> {
    return this.http.get<TramiteDto[]>(`${this.baseUrl}/all`)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * Maneja los errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido en el servicio de productos';

    if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor de productos.';
    } else if (error.status === 404) {
      errorMessage = 'No se encontraron productos.';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Error en la solicitud de productos.';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor de productos.';
    }

    console.error('Error en ProductoService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
