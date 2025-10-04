import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// DTOs para las respuestas de la API
export interface DashboardResumenDTO {
  totalTramites: number;
  tramitesPorEstado: Array<{ estado: string; cantidad: number }>;
  totalRegistros: number;
  registrosVigentes: number;
  registrosPorVencer: number;
  requerimientosPendientes: number;
}

export interface TramitePorEstadoDTO {
  estado: string;
  cantidad: number;
}

export interface TramitePorMesDTO {
  mes: number;
  cantidad: number;
}

export interface RequerimientoPendienteDTO {
  id: number;
  tramiteId: number;
  number: string;
  title: string;
  deadline: string;
  diasRestantes: number;
}

export interface TramiteRecienteDTO {
  id: number;
  radicadoNumber: string;
  productName: string;
  procedureType: string;
  currentStatus: string;
  lastUpdate: string;
}


export interface DashboardConfig {
  diasVencimiento: number;
  limitRequerimientos: number;
  autoRefreshInterval: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly basePath = `${environment.apiUrl}/api/dashboard`;
  private readonly configKey = 'dashboard-config';

  constructor(private http: HttpClient) {}

  // Endpoints de la API
  getResumen(diasVencimiento?: number): Observable<DashboardResumenDTO> {
    let params = new HttpParams();
    if (diasVencimiento) {
      params = params.set('diasVencimiento', diasVencimiento.toString());
    }
    return this.http.get<DashboardResumenDTO>(`${this.basePath}/resumen`, { params });
  }

  getTramitesPorEstado(): Observable<TramitePorEstadoDTO[]> {
    return this.http.get<TramitePorEstadoDTO[]>(`${this.basePath}/tramites/por-estado`);
  }

  getTramitesPorMes(year?: number): Observable<TramitePorMesDTO[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<TramitePorMesDTO[]>(`${this.basePath}/tramites/por-mes`, { params });
  }

  getTramitesRecientes(limit?: number): Observable<TramiteRecienteDTO[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<TramiteRecienteDTO[]>(`${this.basePath}/tramites/recientes`, { params });
  }

  getRequerimientosPendientes(limit?: number): Observable<RequerimientoPendienteDTO[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<RequerimientoPendienteDTO[]>(`${this.basePath}/requerimientos/pendientes`, { params });
  }

  getRegistrosPorAno(year: number): Observable<number> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<number>(`${this.basePath}/registros/por-ano`, { params });
  }

  // Configuración persistente
  private getDefaultConfig(): DashboardConfig {
    return {
      diasVencimiento: 30,
      limitRequerimientos: 5,
      autoRefreshInterval: 90000
    };
  }

  getConfig(): DashboardConfig {
    const stored = localStorage.getItem(this.configKey);
    return stored ? JSON.parse(stored) : this.getDefaultConfig();
  }

  saveConfig(config: DashboardConfig): void {
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  // Utilidades
  mapearEstado(estado: string): string {
    const mapeo: { [key: string]: string } = {
      'RADICADO': 'Radicado',
      'EN_EVALUACION_TECNICA': 'En Evaluación Técnica',
      'REQUIERE_INFORMACION': 'Requiere Información',
      'APROBADO': 'Aprobado',
      'RECHAZADO': 'Rechazado'
    };
    return mapeo[estado] || estado;
  }

  obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || `Mes ${mes}`;
  }

  calcularSemaforoDias(diasRestantes: number): { color: string; texto: string; clase: string } {
    if (diasRestantes <= 0) {
      return { color: '#dc3545', texto: 'Vencido', clase: 'text-danger' };
    } else if (diasRestantes <= 3) {
      return { color: '#fd7e14', texto: `${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`, clase: 'text-warning' };
    } else {
      return { color: '#198754', texto: `${diasRestantes} días`, clase: 'text-success' };
    }
  }
}
