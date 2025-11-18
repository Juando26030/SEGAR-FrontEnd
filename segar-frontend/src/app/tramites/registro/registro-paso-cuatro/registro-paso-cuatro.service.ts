import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Backend DTOs
export interface TrackingDTO {
  radicadoNumber: string;
  submissionDate: string; // ISO or localized string
  procedureType: string;
  productName: string;
  currentStatus: string; // already localized per backend
  daysElapsed: number;
}

export interface TimelineEventDTO {
  id: number;
  title: string;
  description: string;
  date: string; // already formatted in backend
  completed: boolean;
  current: boolean;
}

export interface RequirementDTO {
  id: number;
  number: string;
  title: string;
  description: string;
  daysRemaining: number;
  status: string; // Pendiente|Respondido|Vencido
  date: string;
}

export interface NotificationDTO {
  id: number;
  type: 'requirement' | 'status' | 'alert' | 'info';
  title: string;
  message: string;
  date: string; // formatted
  read: boolean;
}

export interface NotificationSettingsDTO {
  email: boolean;
  sms: boolean;
  requirements: boolean;
  statusUpdates: boolean;
}

@Injectable({ providedIn: 'root' })
export class RegistroPasoCuatroService {
  private readonly base = `${environment.apiUrl}/api/tramites`;

  constructor(private http: HttpClient) {}

  getTracking(id: number, token: string): Observable<TrackingDTO> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<TrackingDTO>(`${this.base}/${id}/tracking`, { headers });
  }

  getTimeline(id: number, token: string): Observable<TimelineEventDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<TimelineEventDTO[]>(`${this.base}/${id}/timeline`, { headers });
  }

  refreshStatus(id: number, token: string): Observable<TrackingDTO> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<TrackingDTO>(`${this.base}/${id}/refresh-status`, {}, { headers });
  }

  getRequirements(id: number, token: string, estado?: string): Observable<RequirementDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<RequirementDTO[]>(`${this.base}/${id}/requerimientos`, { params ,  headers });
  }

  getRequirement(id: number, reqId: number, token: string): Observable<RequirementDTO> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<RequirementDTO>(`${this.base}/${id}/requerimientos/${reqId}`, { headers });
  }

  respondRequirement(id: number, reqId: number, mensaje: string, archivos: File[], token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const fd = new FormData();
    fd.append('mensaje', mensaje);
    archivos.forEach(f => fd.append('archivos', f));
    return this.http.post<void>(`${this.base}/${id}/requerimientos/${reqId}/respuesta`, fd, { headers });
  }

  getNotifications(id: number, token: string): Observable<NotificationDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<NotificationDTO[]>(`${this.base}/${id}/notificaciones`, { headers });
  }

  markAsRead(id: number, notifId: number, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<void>(`${this.base}/${id}/notificaciones/${notifId}/read`, {}, { headers });
  }

  getNotifSettings(id: number, token: string): Observable<NotificationSettingsDTO> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<NotificationSettingsDTO>(`${this.base}/${id}/notificaciones/settings`, { headers });
  }

  updateNotifSettings(id: number, settings: NotificationSettingsDTO, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<void>(`${this.base}/${id}/notificaciones/settings`, settings, { headers });
  }

  downloadCertificate(id: number): void {
    window.open(`${this.base}/${id}/certificado`, '_blank');
  }
}
