import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EmpresaBackend {
  id: number;
  nit: string;
  razonSocial: string;
  telefono: string;
  email: string;
  direccion: string;
  representanteLegal: string;
  estado: 'ACTIVA' | 'INACTIVA';
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las empresas
   */
  getAllEmpresas(): Observable<EmpresaBackend[]> {
    return this.http.get<EmpresaBackend[]>(`${this.baseUrl}/empresas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una empresa por ID
   */
  getEmpresaPorId(id: number): Observable<EmpresaBackend> {
    return this.http.get<EmpresaBackend>(`${this.baseUrl}/empresas/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crea una nueva empresa
   */
  crearEmpresa(empresa: Omit<EmpresaBackend, 'id'>): Observable<EmpresaBackend> {
    return this.http.post<EmpresaBackend>(`${this.baseUrl}/empresas`, empresa)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca empresas por NIT
   */
  buscarEmpresaPorNit(nit: string): Observable<EmpresaBackend> {
    return this.http.get<EmpresaBackend>(`${this.baseUrl}/empresas/nit/${nit}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Maneja los errores de la API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en EmpresaService:', error);
    let errorMessage = 'Ocurrió un error inesperado en el servicio de empresas';

    if (error.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tu autenticación.';
    } else if (error.status === 404) {
      errorMessage = 'Empresa no encontrada.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor de empresas.';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
