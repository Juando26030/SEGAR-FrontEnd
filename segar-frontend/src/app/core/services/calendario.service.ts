import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoDTO, CrearEventoDTO, EstadisticasCalendarioDTO } from '../DTOs/calendario.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly apiUrl = `${environment.apiUrl}/api/calendario`;

  constructor(private http: HttpClient) {}

  obtenerTodosLosEventos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos`);
  }

  obtenerEventosPorMes(mes: number, anio: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/${mes}/${anio}`);
  }

  obtenerEventoPorId(id: number): Observable<EventoDTO> {
    return this.http.get<EventoDTO>(`${this.apiUrl}/eventos/${id}`);
  }

  crearEvento(evento: CrearEventoDTO): Observable<EventoDTO> {
    return this.http.post<EventoDTO>(`${this.apiUrl}/eventos`, evento);
  }

  actualizarEvento(id: number, evento: CrearEventoDTO): Observable<EventoDTO> {
    return this.http.put<EventoDTO>(`${this.apiUrl}/eventos/${id}`, evento);
  }

  eliminarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eventos/${id}`);
  }

  marcarComoCompletado(id: number): Observable<EventoDTO> {
    return this.http.patch<EventoDTO>(`${this.apiUrl}/eventos/${id}/completar`, {});
  }

  obtenerEventosPorEmpresa(empresaId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/empresa/${empresaId}/eventos`);
  }

  obtenerEstadisticas(): Observable<EstadisticasCalendarioDTO> {
    return this.http.get<EstadisticasCalendarioDTO>(`${this.apiUrl}/estadisticas`);
  }

  obtenerTiposEvento(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipos`);
  }

  obtenerCategoriasEvento(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`);
  }

  obtenerPrioridadesEvento(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/prioridades`);
  }

  obtenerEstadosEvento(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/estados`);
  }

  obtenerEventosProximos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/proximos`);
  }

  // Endpoints por Empresa
  obtenerEventosPorMesEmpresa(empresaId: number, mes: number, anio: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/empresa/${empresaId}/eventos/${mes}/${anio}`);
  }

  obtenerTodosLosEventosEmpresa(empresaId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/empresa/${empresaId}/eventos`);
  }

  obtenerEstadisticasEmpresa(empresaId: number): Observable<EstadisticasCalendarioDTO> {
    return this.http.get<EstadisticasCalendarioDTO>(`${this.apiUrl}/empresa/${empresaId}/estadisticas`);
  }

  obtenerEventosProximosEmpresa(empresaId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/empresa/${empresaId}/eventos/proximos`);
  }

  // Endpoints por Usuario
  obtenerEventosPorMesUsuario(usuarioId: number, mes: number, anio: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/usuario/${usuarioId}/eventos/${mes}/${anio}`);
  }

  obtenerTodosLosEventosUsuario(usuarioId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/usuario/${usuarioId}/eventos`);
  }

  obtenerEstadisticasUsuario(usuarioId: number): Observable<EstadisticasCalendarioDTO> {
    return this.http.get<EstadisticasCalendarioDTO>(`${this.apiUrl}/usuario/${usuarioId}/estadisticas`);
  }

  obtenerEventosProximosUsuario(usuarioId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/usuario/${usuarioId}/eventos/proximos`);
  }
}
