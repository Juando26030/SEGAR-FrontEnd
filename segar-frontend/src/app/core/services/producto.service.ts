import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto } from '../DTOs/solicitud.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly baseUrl = `${environment.apiUrl}/api/producto`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos disponibles
   */
  getAllProductos(token: string): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Producto[]>(`${this.baseUrl}/all`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crea un nuevo producto
   */
  createProducto(producto: Omit<Producto, 'id'>, token: string): Observable<Producto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Producto>(`${this.baseUrl}/create`, producto, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un producto por ID
   */
  deleteProducto(id: number, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un producto por ID
   */
  getProductoPorId(id: number, token: string): Observable<Producto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Producto>(`${this.baseUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un producto por ID
   */
  updateProducto(id: number, producto: Producto, token: string): Observable<Producto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene productos de una empresa que no están asociados a trámites
   */
  getProductosSinTramites(empresaId: number, token: string): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Producto[]>(`${this.baseUrl}/empresa/${empresaId}/sin-tramites`, { headers })
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


  /**
   * Obtiene los productos de una empresa con registro sanitario vigente
   */
  getProductosConRegistroVigente(empresaId: number, token: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/empresa/${empresaId}/con-registro-vigente`;
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener productos con registro vigente:', error);
        return throwError(() => error);
      })
    );
  }

  getProductosByEmpresaId(empresaId: number, token: string): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Producto[]>(`${this.baseUrl}/empresa/${empresaId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

}
