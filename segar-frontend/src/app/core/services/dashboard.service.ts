// dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// DTOs para las respuestas de la API


export interface BusquedaGlobalResponseDTO {
  tramites: TramiteBusquedaDTO[];
  registros: RegistroBusquedaDTO[];
  totalTramites: number;
  totalRegistros: number;
}

export interface TramiteBusquedaDTO {
  id: number;
  radicadoNumber: string;
  productName: string;
  procedureType: string;
  currentStatus: string;
  submissionDate: string;
  lastUpdate: string;
}

export interface RegistroBusquedaDTO {
  id: number;
  numeroRegistro: string;
  productName: string;
  estado: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
}

// DTOs para las respuestas de la API
export interface DashboardResumenDTO {
  totalTramites: number;
  tramitesPorEstado: Array<{ estado: string; cantidad: number }>;
  totalRegistros: number;
  registrosVigentes: number;
  registrosPorVencer: number;
  registrosVencidos: number;
  requerimientosPendientes: number;
}

// Agregar la nueva interfaz DTO al inicio del archivo
export interface TramiteEstadisticasDTO {
  diasTranscurridos: number;
  totalEventos: number;
  eventosCompletados: number;
  requerimientosPendientes: number;
  notificacionesNoLeidas: number;
  porcentajeProgreso: number;
}

export interface TramiteDetalleDTO {
  id: number;
  radicadoNumber: string;
  submissionDate: string;
  procedureType: string;
  productName: string;
  currentStatus: string;
  lastUpdate: string;
  eventos: any[];
  requerimientos: any[];
  notificaciones: any[];
  historial: any[];
  estadisticas: TramiteEstadisticasDTO;
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

  constructor(private http: HttpClient) {}

  // ==================== RESUMEN ====================
  getResumen(diasVencimiento?: number, empresaId?: number, usuarioId?: number, token?: string): Observable<DashboardResumenDTO> {
    let params = new HttpParams();
    if (diasVencimiento && !usuarioId) params = params.set('diasVencimiento', diasVencimiento.toString()); // Solo para global y empresa
    const baseUrl = empresaId ? `${this.basePath}/resumen/empresa/${empresaId}` : usuarioId ? `${this.basePath}/resumen/usuario/${usuarioId}` : `${this.basePath}/resumen`;
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<DashboardResumenDTO>(baseUrl, { headers, params });
  }

  // ==================== TRÁMITES POR ESTADO ====================
  getTramitesPorEstado(empresaId?: number, usuarioId?: number, token?: string): Observable<TramitePorEstadoDTO[]> {
    const baseUrl = empresaId ? `${this.basePath}/tramites/por-estado/empresa/${empresaId}` : usuarioId ? `${this.basePath}/tramites/por-estado/usuario/${usuarioId}` : `${this.basePath}/tramites/por-estado`;
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<TramitePorEstadoDTO[]>(baseUrl, { headers });
  }

  // ==================== TRÁMITES POR MES ====================
  getTramitesPorMes(year?: number, empresaId?: number, usuarioId?: number, token?: string): Observable<TramitePorMesDTO[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    const baseUrl = empresaId ? `${this.basePath}/tramites/por-mes/empresa/${empresaId}` : usuarioId ? `${this.basePath}/tramites/por-mes/usuario/${usuarioId}` : `${this.basePath}/tramites/por-mes`;
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<TramitePorMesDTO[]>(baseUrl, { headers, params });
  }

  // ==================== TRÁMITES RECIENTES ====================
  getTramitesRecientes(limit?: number, empresaId?: number, usuarioId?: number, token?: string): Observable<TramiteRecienteDTO[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    const baseUrl = empresaId ? `${this.basePath}/tramites/recientes/empresa/${empresaId}` : usuarioId ? `${this.basePath}/tramites/recientes/usuario/${usuarioId}` : `${this.basePath}/tramites/recientes`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<TramiteRecienteDTO[]>(baseUrl, { headers, params });
  }

  // ==================== REQUERIMIENTOS PENDIENTES ====================
  getRequerimientosPendientes(limit?: number, empresaId?: number, usuarioId?: number, token?: string): Observable<RequerimientoPendienteDTO[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    const baseUrl = empresaId ? `${this.basePath}/requerimientos/pendientes/empresa/${empresaId}` : usuarioId ? `${this.basePath}/requerimientos/pendientes/usuario/${usuarioId}` : `${this.basePath}/requerimientos/pendientes`;
    return this.http.get<RequerimientoPendienteDTO[]>(baseUrl, { params });
  }

  // ==================== REGISTROS POR AÑO ====================
  getRegistrosPorAno(year: number, empresaId?: number, token?: string): Observable<number> {
    const params = new HttpParams().set('year', year.toString());
    const baseUrl = empresaId ? `${this.basePath}/registros/por-ano/empresa/${empresaId}` : `${this.basePath}/registros/por-ano`;
    return this.http.get<number>(baseUrl, { params });
  }

  // ==================== DETALLE TRÁMITE ====================
  getTramiteDetalle(id: number, token?: string): Observable<any> { // Ajusta el tipo si tienes TramiteDetalleDTO
    return this.http.get(`${this.basePath}/tramite/${id}`);
  }

  // ==================== BÚSQUEDA GLOBAL ====================
  busquedaGlobal(query: string, limitTramites?: number, limitRegistros?: number, empresaId?: number, usuarioId?: number, token?: string): Observable<BusquedaGlobalResponseDTO> {
    let params = new HttpParams().set('q', query);
    if (limitTramites) params = params.set('limitTramites', limitTramites.toString());
    if (limitRegistros && !usuarioId) params = params.set('limitRegistros', limitRegistros.toString()); // Solo para global y empresa
    const baseUrl = empresaId ? `${this.basePath}/busqueda/empresa/${empresaId}` : usuarioId ? `${this.basePath}/busqueda/usuario/${usuarioId}` : `${this.basePath}/busqueda`;
    return this.http.get<BusquedaGlobalResponseDTO>(baseUrl, { params });
  }

  // ==================== UTILIDADES ====================
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
