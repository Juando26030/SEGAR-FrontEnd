import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoDTO, CrearEventoDTO, EstadisticasCalendarioDTO } from '../DTOs/calendario.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly apiUrl = `${environment.apiUrl}/api/calendario`;

  constructor(private http: HttpClient) {}

  obtenerTodosLosEventos(token?: string): Observable<EventoDTO[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos`, { headers });
  }

  obtenerEventosPorMes(mes: number, anio: number, token?: string): Observable<EventoDTO[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/${mes}/${anio}`, { headers });
  }

  obtenerEventoPorId(id: number, token?: string): Observable<EventoDTO> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EventoDTO>(`${this.apiUrl}/eventos/${id}`, { headers });
  }

  crearEvento(evento: CrearEventoDTO, token?: string): Observable<EventoDTO> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.post<EventoDTO>(`${this.apiUrl}/eventos`, evento, { headers });
  }

  actualizarEvento(id: number, evento: CrearEventoDTO, token?: string): Observable<EventoDTO> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.put<EventoDTO>(`${this.apiUrl}/eventos/${id}`, evento, { headers });
  }

  eliminarEvento(id: number, token?: string): Observable<void> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/eventos/${id}`, { headers });
  }

  marcarComoCompletado(id: number, token?: string): Observable<EventoDTO> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.patch<EventoDTO>(`${this.apiUrl}/eventos/${id}/completar`, { headers });
  }

  obtenerEventosPorEmpresa(empresaId: number, token?: string): Observable<EventoDTO[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/empresa/${empresaId}`, { headers });
  }

  obtenerEstadisticas(token?: string): Observable<EstadisticasCalendarioDTO> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EstadisticasCalendarioDTO>(`${this.apiUrl}/estadisticas`, { headers });
  }

  obtenerTiposEvento(token?: string): Observable<string[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<string[]>(`${this.apiUrl}/tipos`, { headers });
  }

  obtenerCategoriasEvento(token?: string): Observable<string[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<string[]>(`${this.apiUrl}/categorias`, { headers });
  }

  obtenerPrioridadesEvento(token?: string): Observable<string[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<string[]>(`${this.apiUrl}/prioridades`, { headers });
  }

  obtenerEventosProximos(token?: string): Observable<EventoDTO[]> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/proximos`, { headers });
  }

}
