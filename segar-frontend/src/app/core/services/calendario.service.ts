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
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/empresa/${empresaId}`);
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

  obtenerEventosProximos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/proximos`);
  }

}
