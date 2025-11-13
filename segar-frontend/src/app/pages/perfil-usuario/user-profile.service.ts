import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TramiteDto } from '../../core/DTOs/tramite.dto';

export interface UserStats {
  tramitesActivos: number;
  tramitesCompletados: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly baseUrl = `${environment.apiUrl}/api/tramites`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las estadísticas del usuario
   */
  getUserStats(usuarioId: number): Observable<UserStats> {
    return this.http.get<TramiteDto[]>(`${this.baseUrl}/usuario/${usuarioId}`)
      .pipe(
        map(tramites => {
          const tramitesActivos = tramites.filter(t =>
            t.currentStatus !== 'APROBADO' &&
            t.currentStatus !== 'RECHAZADO'
          ).length;

          const tramitesCompletados = tramites.filter(t =>
            t.currentStatus === 'APROBADO'
          ).length;

          return {
            tramitesActivos,
            tramitesCompletados
          };
        })
      );
  }

  /**
   * Obtiene todos los trámites del usuario
   */
  getTramitesByUsuario(usuarioId: number): Observable<TramiteDto[]> {
    return this.http.get<TramiteDto[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }
}

