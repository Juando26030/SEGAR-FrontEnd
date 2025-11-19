import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para los DTOs
export interface ClasificacionProductoDTO {
  categoriaAlimento: string;
  esImportado: boolean;
  requiereRefrigeracion: boolean;
  esOrganico: boolean;
  contieneAditivos: boolean;
  esGMO: boolean;
  destinoConsumo: string;
  riesgoSanitario?: string;
  observaciones?: string;
}

export interface ClasificacionProducto {
  id: number;
  productoId: number;
  categoriaAlimento: string;
  esImportado: boolean;
  requiereRefrigeracion: boolean;
  esOrganico: boolean;
  contieneAditivos: boolean;
  esGMO: boolean;
  destinoConsumo: string;
  riesgoSanitario: string;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClasificacionProductoService {
  private readonly API_URL = `${environment.apiUrl}/api/clasificacion-producto`;

  constructor(private http: HttpClient) {}

  /**
   * Guarda una nueva clasificación de producto
   */
  guardarClasificacion(
    productoId: number,
    clasificacion: ClasificacionProductoDTO,
    token: string
  ): Observable<ClasificacionProducto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<ClasificacionProducto>(
      `${this.API_URL}/${productoId}`,
      clasificacion, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene la clasificación de un producto específico
   */
  obtenerClasificacion(productoId: number, token: string): Observable<ClasificacionProducto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<ClasificacionProducto>(
      `${this.API_URL}/${productoId}`, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una clasificación existente
   */
  actualizarClasificacion(
    productoId: number,
    clasificacion: ClasificacionProductoDTO,
    token: string
  ): Observable<ClasificacionProducto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<ClasificacionProducto>(
      `${this.API_URL}/${productoId}`,
      clasificacion, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verifica si un producto tiene clasificación
   */
  tieneClasificacion(productoId: number, token: string): Observable<boolean> {
    return this.obtenerClasificacion(productoId, token).pipe(
      map(() => true),
      catchError(() => [false])
    );
  }

  /**
   * Valida los datos de clasificación antes de enviar
   */
  validarClasificacion(clasificacion: ClasificacionProductoDTO): string[] {
    const errores: string[] = [];

    if (!clasificacion.categoriaAlimento) {
      errores.push('La categoría de alimento es obligatoria');
    }

    if (!clasificacion.destinoConsumo) {
      errores.push('El destino de consumo es obligatorio');
    }

    if (clasificacion.esImportado && !clasificacion.observaciones) {
      errores.push('Para productos importados se requieren observaciones adicionales');
    }

    return errores;
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos de clasificación inválidos';
          break;
        case 404:
          errorMessage = 'Clasificación no encontrada';
          break;
        case 409:
          errorMessage = 'Ya existe una clasificación para este producto';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en ClasificacionProductoService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

