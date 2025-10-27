import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto } from '../DTOs/solicitud.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly baseUrl = `${environment.apiUrl}/producto`;


  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos disponibles
   */
  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/all`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un producto por ID
   */
  getProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca productos por nombre
   */
  buscarProductosPorNombre(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?nombre=${encodeURIComponent(nombre)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene productos por fabricante
   */
  getProductosPorFabricante(fabricante: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/fabricante/${encodeURIComponent(fabricante)}`)
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
