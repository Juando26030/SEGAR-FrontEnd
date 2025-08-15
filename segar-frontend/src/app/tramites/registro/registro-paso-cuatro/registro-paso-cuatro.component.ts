import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-paso-cuatro.component.html',
  styleUrls: ['./registro-paso-cuatro.component.css']
})
export class RegistroPasoCuatroComponent implements OnInit {
  activeTab = 'seguimiento';

  readonly tabs: Tab[] = [
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'requerimientos', label: 'Requerimientos' },
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'ayuda', label: 'Ayuda' }
  ];

  trackingInfo: TrackingInfo = {
    radicadoNumber: '2024-001234-56789',
    submissionDate: '15 de marzo de 2024',
    procedureType: 'Registro Sanitario - Alimento de Riesgo Medio',
    productName: 'Yogurt Natural Premium',
    currentStatus: 'En evaluación técnica',
    daysElapsed: 28
  };

  timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Solicitud Radicada',
      description: 'Documentos recibidos y radicado asignado',
      date: '15 de marzo de 2024',
      completed: true,
      current: false
    },
    {
      id: '2',
      title: 'Verificación Documental',
      description: 'Revisión inicial de documentos completada',
      date: '20 de marzo de 2024',
      completed: true,
      current: false
    },
    {
      id: '3',
      title: 'Evaluación Técnica',
      description: 'Análisis técnico del producto en curso',
      date: '25 de marzo de 2024',
      completed: false,
      current: true
    },
    {
      id: '4',
      title: 'Concepto Técnico',
      description: 'Emisión del concepto técnico final',
      date: 'Pendiente',
      completed: false,
      current: false
    },
    {
      id: '5',
      title: 'Expedición del Registro',
      description: 'Emisión del registro sanitario',
      date: 'Pendiente',
      completed: false,
      current: false
    }
  ];

  pendingRequirements: Requirement[] = [
    {
      id: 'req-001',
      number: 'REQ-2024-001234-01',
      title: 'Información nutricional complementaria',
      description: 'Se requiere información adicional sobre el contenido nutricional del producto y metodología de análisis utilizada.',
      daysRemaining: 12,
      status: 'Pendiente',
      date: '2 de abril de 2024'
    }
  ];

  requirementHistory: Requirement[] = [
    {
      id: 'req-002',
      number: 'REQ-2024-001234-02',
      title: 'Clarificación proceso de fabricación',
      description: 'Descripción detallada del proceso de pasteurización',
      daysRemaining: 0,
      status: 'Respondido',
      date: '28 de marzo de 2024'
    }
  ];

  notifications: Notification[] = [
    {
      id: 'not-001',
      type: 'requirement',
      title: 'Nuevo requerimiento recibido',
      message: 'Se ha generado un nuevo requerimiento para su trámite. Tiene 15 días hábiles para responder.',
      date: '2 de abril de 2024',
      read: false
    },
    {
      id: 'not-002',
      type: 'status',
      title: 'Cambio de estado del trámite',
      message: 'Su trámite ha pasado a evaluación técnica.',
      date: '25 de marzo de 2024',
      read: true
    }
  ];

  notificationSettings: NotificationSettings = {
    email: true,
    sms: false,
    requirements: true,
    statusUpdates: true
  };

  faqs: FAQ[] = [
    {
      id: 'faq-001',
      question: '¿Cuánto tiempo demora la evaluación de mi trámite?',
      answer: 'El tiempo de evaluación varía según el tipo de trámite: 60 días hábiles para trámite ordinario y 30 días hábiles para trámite urgente.',
      isOpen: false
    },
    {
      id: 'faq-002',
      question: '¿Qué pasa si no respondo un requerimiento a tiempo?',
      answer: 'Si no responde dentro del plazo establecido (15 días hábiles), su trámite será rechazado y deberá iniciar un nuevo proceso.',
      isOpen: false
    },
    {
      id: 'faq-003',
      question: '¿Puedo modificar mi solicitud después de radicarla?',
      answer: 'No es posible modificar la solicitud una vez radicada. Solo puede proporcionar información adicional en respuesta a requerimientos.',
      isOpen: false
    },
    {
      id: 'faq-004',
      question: '¿Cómo puedo acelerar el proceso de evaluación?',
      answer: 'Puede optar por el trámite urgente pagando la tarifa correspondiente, siempre que cumpla con los requisitos establecidos.',
      isOpen: false
    }
  ];

  helpDocuments: HelpDocument[] = [
    { name: 'Manual de Usuario del Sistema', url: '#' },
    { name: 'Guía de Trámites INVIMA', url: '#' },
    { name: 'Resolución 2674 de 2013', url: '#' },
    { name: 'Decreto 539 de 2014', url: '#' },
    { name: 'Manual Tarifario Vigente', url: '#' },
    { name: 'Formato de Respuesta a Requerimientos', url: '#' }
  ];

  ngOnInit(): void {
    // Inicialización del componente
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
    console.log('Actualizando estado del trámite...');
    // Simular actualización
    alert('Estado actualizado correctamente');
  }

  canDownloadCertificate(): boolean {
    return this.trackingInfo.currentStatus === 'Aprobado';
  }

  downloadCertificate(): void {
    if (this.canDownloadCertificate()) {
      console.log('Descargando certificado...');
      alert('Descarga del certificado iniciada');
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
    console.log('Guardando configuración de notificaciones:', this.notificationSettings);
    alert('Configuración de notificaciones guardada correctamente');
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
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
