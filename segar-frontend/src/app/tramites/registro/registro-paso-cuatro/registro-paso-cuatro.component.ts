import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistroPasoCuatroService } from './registro-paso-cuatro.service';


interface Tab {
  id: string;
  label: string;
}

interface TrackingInfo {
  radicadoNumber: string;
  submissionDate: string;
  procedureType: string;
  productName: string;
  currentStatus: string;
  daysElapsed: number;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
}

interface Requirement {
  id: string;
  number: string;
  title: string;
  description: string;
  daysRemaining: number;
  status: string;
  date: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  requirements: boolean;
  statusUpdates: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

interface HelpDocument {
  name: string;
  url: string;
}

@Component({
  standalone: true,
  selector: 'app-registro-paso-cuatro',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './registro-paso-cuatro.component.html',
  styleUrls: ['./registro-paso-cuatro.component.css']
})
export class RegistroPasoCuatroComponent implements OnInit {
  activeTab = 'seguimiento';
  private tramiteId = 1; // TODO: obtener desde ruta o contexto

  constructor(private paso4: RegistroPasoCuatroService) {}

  readonly tabs: Tab[] = [
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'requerimientos', label: 'Requerimientos' },
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'ayuda', label: 'Ayuda' }
  ];

  trackingInfo: TrackingInfo = {
    radicadoNumber: '',
    submissionDate: '',
    procedureType: '',
    productName: '',
    currentStatus: '',
    daysElapsed: 0
  };

  timelineEvents: TimelineEvent[] = [];

  pendingRequirements: Requirement[] = [];

  requirementHistory: Requirement[] = [];

  notifications: Notification[] = [];

  notificationSettings: NotificationSettings = {
    email: false,
    sms: false,
    requirements: false,
    statusUpdates: false
  };

  faqs: FAQ[] = [];

  helpDocuments: HelpDocument[] = [];

  ngOnInit(): void {
    // Cargar datos reales desde el backend
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    // Tracking
    this.paso4.getTracking(this.tramiteId).subscribe({
      next: (t) => {
        this.trackingInfo = {
          radicadoNumber: t.radicadoNumber,
          submissionDate: t.submissionDate,
          procedureType: t.procedureType,
          productName: t.productName,
          currentStatus: t.currentStatus,
          daysElapsed: t.daysElapsed
        };
      },
      error: (e) => console.error('Error cargando tracking', e)
    });

    // Timeline
    this.paso4.getTimeline(this.tramiteId).subscribe({
      next: (events) => {
        this.timelineEvents = events.map(e => ({
          id: String(e.id),
          title: e.title,
          description: e.description,
          date: e.date,
          completed: e.completed,
          current: e.current
        }));
      },
      error: (e) => console.error('Error cargando timeline', e)
    });

    // Requerimientos pendientes
    this.paso4.getRequirements(this.tramiteId, 'PENDIENTE').subscribe({
      next: (reqs) => {
        this.pendingRequirements = reqs.map(r => ({
          id: String(r.id),
          number: r.number,
          title: r.title,
          description: r.description,
          daysRemaining: r.daysRemaining,
          status: r.status,
          date: r.date
        }));
      },
      error: (e) => console.error('Error cargando requerimientos pendientes', e)
    });

    // Historial de requerimientos respondidos
    this.paso4.getRequirements(this.tramiteId, 'RESPONDIDO').subscribe({
      next: (reqs) => {
        this.requirementHistory = reqs.map(r => ({
          id: String(r.id),
          number: r.number,
          title: r.title,
          description: r.description,
          daysRemaining: r.daysRemaining,
          status: r.status,
          date: r.date
        }));
      },
      error: (e) => console.error('Error cargando historial de requerimientos', e)
    });

    // Notificaciones
    this.paso4.getNotifications(this.tramiteId).subscribe({
      next: (notifs) => {
        this.notifications = notifs.map(n => ({
          id: String(n.id),
          type: n.type,
          title: n.title,
          message: n.message,
          date: n.date,
          read: n.read
        }));
      },
      error: (e) => console.error('Error cargando notificaciones', e)
    });

    // Settings de notificaciones
    this.paso4.getNotifSettings(this.tramiteId).subscribe({
      next: (s) => { this.notificationSettings = { ...s }; },
      error: (e) => console.error('Error cargando configuración de notificaciones', e)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'Radicado': 'text-blue-600 font-medium',
      'En evaluación técnica': 'text-orange-600 font-medium',
      'Aprobado': 'text-green-600 font-medium',
      'Rechazado': 'text-red-600 font-medium',
      'Requiere información': 'text-yellow-600 font-medium'
    };
    return statusClasses[status] || 'text-gray-600';
  }

  getRequirementStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'Pendiente': 'bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs',
      'Respondido': 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs',
      'Vencido': 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs';
  }

  getNotificationIcon(type: string): string {
    const iconClasses: Record<string, string> = {
      'requirement': 'h-5 w-5 text-orange-600',
      'status': 'h-5 w-5 text-blue-600',
      'alert': 'h-5 w-5 text-red-600',
      'info': 'h-5 w-5 text-gray-600'
    };
    return iconClasses[type] || 'h-5 w-5 text-gray-600';
  }

  refreshStatus(): void {
    this.paso4.refreshStatus(this.tramiteId).subscribe({
      next: (t) => {
        this.trackingInfo = {
          radicadoNumber: t.radicadoNumber,
          submissionDate: t.submissionDate,
          procedureType: t.procedureType,
          productName: t.productName,
          currentStatus: t.currentStatus,
          daysElapsed: t.daysElapsed
        };
        // refrescar timeline para reflejar cambios de estado
        this.paso4.getTimeline(this.tramiteId).subscribe({
          next: (events) => {
            this.timelineEvents = events.map(e => ({
              id: String(e.id),
              title: e.title,
              description: e.description,
              date: e.date,
              completed: e.completed,
              current: e.current
            }));
          },
          error: (e) => console.error('Error recargando timeline', e)
        });
      },
      error: (e) => console.error('Error actualizando estado', e)
    });
  }

  canDownloadCertificate(): boolean {
    return this.trackingInfo.currentStatus === 'Aprobado';
  }

  downloadCertificate(): void {
    if (this.canDownloadCertificate()) {
      this.paso4.downloadCertificate(this.tramiteId);
    }
  }

  viewDocuments(): void {
    console.log('Abriendo documentos del trámite...');
    alert('Abriendo ventana de documentos');
  }

  openRequirement(requirementId: string): void {
    console.log('Abriendo requerimiento:', requirementId);
    alert(`Abriendo detalles del requerimiento ${requirementId}`);
  }

  respondRequirement(requirementId: string): void {
    console.log('Respondiendo requerimiento:', requirementId);
    alert(`Iniciando respuesta al requerimiento ${requirementId}`);
  }

  viewRequirementDetail(requirementId: string): void {
    console.log('Viendo detalle del requerimiento:', requirementId);
    alert(`Mostrando detalles del requerimiento ${requirementId}`);
  }

  saveNotificationSettings(): void {
    this.paso4.updateNotifSettings(this.tramiteId, this.notificationSettings).subscribe({
      next: () => {
        // Opcional: feedback visual
        console.log('Configuración de notificaciones guardada');
      },
      error: (e) => console.error('Error guardando configuración de notificaciones', e)
    });
  }

  markAsRead(notificationId: string): void {
    const notifNum = Number(notificationId);
    this.paso4.markAsRead(this.tramiteId, notifNum).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) notification.read = true;
      },
      error: (e) => console.error('Error marcando notificación como leída', e)
    });
  }

  toggleFaq(faqId: string): void {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  // TrackBy functions para optimización
  trackByTab(index: number, tab: Tab): string {
    return tab.id;
  }

  trackByTimeline(index: number, event: TimelineEvent): string {
    return event.id;
  }

  trackByRequirement(index: number, requirement: Requirement): string {
    return requirement.id;
  }

  trackByRequirementHistory(index: number, requirement: Requirement): string {
    return requirement.id;
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  trackByFaq(index: number, faq: FAQ): string {
    return faq.id;
  }

  trackByHelpDoc(index: number, doc: HelpDocument): string {
    return doc.name;
  }
}
