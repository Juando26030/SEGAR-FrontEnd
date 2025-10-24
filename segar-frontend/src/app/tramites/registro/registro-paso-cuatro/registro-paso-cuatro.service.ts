import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


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
  private readonly base = 'http://35.238.19.224:8090/api/tramites';

  constructor(private http: HttpClient) {}

  getTracking(id: number): Observable<TrackingDTO> {
    return this.http.get<TrackingDTO>(`${this.base}/${id}/tracking`);

  }

  getTimeline(id: number): Observable<TimelineEventDTO[]> {
    return this.http.get<TimelineEventDTO[]>(`${this.base}/${id}/timeline`);
  }

  refreshStatus(id: number): Observable<TrackingDTO> {
    return this.http.post<TrackingDTO>(`${this.base}/${id}/refresh-status`, {});
  }

  getRequirements(id: number, estado?: string): Observable<RequirementDTO[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<RequirementDTO[]>(`${this.base}/${id}/requerimientos`, { params });
  }

  getRequirement(id: number, reqId: number): Observable<RequirementDTO> {
    return this.http.get<RequirementDTO>(`${this.base}/${id}/requerimientos/${reqId}`);
  }

  respondRequirement(id: number, reqId: number, mensaje: string, archivos: File[]): Observable<void> {
    const fd = new FormData();
    fd.append('mensaje', mensaje);
    archivos.forEach(f => fd.append('archivos', f));
    return this.http.post<void>(`${this.base}/${id}/requerimientos/${reqId}/respuesta`, fd);
  }

  getNotifications(id: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.base}/${id}/notificaciones`);
  }

  markAsRead(id: number, notifId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/notificaciones/${notifId}/read`, {});
  }

  getNotifSettings(id: number): Observable<NotificationSettingsDTO> {
    return this.http.get<NotificationSettingsDTO>(`${this.base}/${id}/notificaciones/settings`);
  }

  updateNotifSettings(id: number, settings: NotificationSettingsDTO): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/notificaciones/settings`, settings);
  }

  downloadCertificate(id: number): void {
    window.open(`${this.base}/${id}/certificado`, '_blank');
  }
}
