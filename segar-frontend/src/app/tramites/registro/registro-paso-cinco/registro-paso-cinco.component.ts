import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tab {
  id: string;
  label: string;
}

interface ResolutionData {
  registrationNumber: string;
  resolutionDate: string;
  expiryDate: string;
  resolutionNumber: string;
  productName: string;
  brandName: string;
  holder: string;
  manufacturer: string;
  approvedPresentations: string[];
}

interface Obligation {
  title: string;
  description: string;
  frequency: string;
  deadline: string;
}

interface CommercializationRequirement {
  title: string;
  items: string[];
}

interface RenewalStep {
  title: string;
  description: string;
  timeframe: string;
}

interface ContactInfo {
  type: string;
  title: string;
  details: string[];
}

interface UsefulLink {
  title: string;
  url: string;
}

@Component({
  standalone: true,
  selector: 'app-registro-paso-cinco',
  imports: [CommonModule],
  templateUrl: './registro-paso-cinco.component.html',
  styleUrls: ['./registro-paso-cinco.component.css']
})
export class RegistroPasoCincoComponent {
  activeTab = 'resolucion';

  readonly tabs: Tab[] = [
    { id: 'resolucion', label: 'Resolución Final' },
    { id: 'obligaciones', label: 'Obligaciones Post-Registro' },
    { id: 'comercializacion', label: 'Comercialización' },
    { id: 'renovacion', label: 'Renovación' },
    { id: 'contacto', label: 'Contacto y Soporte' }
  ];

  readonly resolutionData: ResolutionData = {
    registrationNumber: 'RSAA21M-20240015',
    resolutionDate: '15 de marzo de 2024',
    expiryDate: '15 de marzo de 2029',
    resolutionNumber: '2024005678',
    productName: 'Yogurt Natural Premium',
    brandName: 'LacteosPremium',
    holder: 'Empresa Alimentaria S.A.S.',
    manufacturer: 'Planta de Producción Bogotá - Empresa Alimentaria S.A.S.',
    approvedPresentations: [
      'Vaso de 150g',
      'Vaso de 250g',
      'Botella de 500ml',
      'Presentación familiar de 1000g'
    ]
  };

  readonly obligations: Obligation[] = [
    {
      title: 'Mantenimiento de Buenas Prácticas de Manufactura (BPM)',
      description: 'Garantizar el cumplimiento continuo de las BPM en todas las etapas de producción, almacenamiento y distribución.',
      frequency: 'Permanente',
      deadline: 'Durante toda la vigencia del registro'
    },
    {
      title: 'Reporte de Cambios Significativos',
      description: 'Informar al INVIMA sobre modificaciones en la formulación, proceso de fabricación, instalaciones o titularidad.',
      frequency: 'Cuando aplique',
      deadline: '30 días calendario previos al cambio'
    },
    {
      title: 'Reporte de Eventos Adversos',
      description: 'Notificar eventos adversos asociados al consumo del producto y medidas correctivas implementadas.',
      frequency: 'Cuando aplique',
      deadline: '24 horas para eventos graves, 15 días para eventos menores'
    },
    {
      title: 'Actualización de Información de Contacto',
      description: 'Mantener actualizada la información de contacto del titular y representante legal ante el INVIMA.',
      frequency: 'Cuando aplique',
      deadline: '10 días calendario posteriores al cambio'
    }
  ];

  readonly commercializationRequirements: CommercializationRequirement[] = [
    {
      title: 'Etiquetado Obligatorio',
      items: [
        'Número de registro sanitario visible en el empaque',
        'Información nutricional completa y actualizada',
        'Lista de ingredientes en orden descendente',
        'Fecha de vencimiento y condiciones de almacenamiento',
        'Información del titular del registro'
      ]
    },
    {
      title: 'Control de Calidad',
      items: [
        'Análisis fisicoquímicos periódicos',
        'Análisis microbiológicos de rutina',
        'Verificación de vida útil declarada',
        'Control de proveedores de materias primas'
      ]
    },
    {
      title: 'Distribución y Comercialización',
      items: [
        'Mantener cadena de frío cuando aplique',
        'Registro de lotes y trazabilidad',
        'Capacitación al personal de ventas',
        'Atención a quejas y reclamos de consumidores'
      ]
    },
    {
      title: 'Documentación de Respaldo',
      items: [
        'Conservar registros de producción por 5 años',
        'Mantener evidencia de análisis de laboratorio',
        'Documentar procedimientos operativos estándar',
        'Archivo de certificaciones de proveedores'
      ]
    }
  ];

  readonly renewalSteps: RenewalStep[] = [
    {
      title: 'Evaluación de Requisitos',
      description: 'Verificar cambios normativos y nuevos requisitos aplicables desde la última renovación.',
      timeframe: '2-3 semanas'
    },
    {
      title: 'Actualización de Documentación',
      description: 'Preparar y actualizar toda la documentación técnica y legal requerida.',
      timeframe: '4-6 semanas'
    },
    {
      title: 'Solicitud de Renovación',
      description: 'Radicar la solicitud de renovación con toda la documentación en la plataforma INVIMA.',
      timeframe: '1 semana'
    },
    {
      title: 'Seguimiento y Respuesta',
      description: 'Atender requerimientos del INVIMA y realizar seguimiento hasta obtener la resolución.',
      timeframe: '8-12 semanas'
    }
  ];

  readonly renewalDocuments: string[] = [
    'Formulario de solicitud de renovación debidamente diligenciado',
    'Certificado de existencia y representación legal actualizado',
    'Ficha técnica del producto actualizada',
    'Análisis fisicoquímicos y microbiológicos recientes',
    'Certificación de Buenas Prácticas de Manufactura vigente',
    'Declaración de no modificación del producto (si aplica)',
    'Comprobante de pago de las tarifas correspondientes'
  ];

  readonly contactInfo: ContactInfo[] = [
    {
      type: 'phone',
      title: 'Línea de Atención',
      details: [
        'Teléfono: (601) 242 50 00',
        'Línea gratuita: 018000 122 100',
        'Horario: Lunes a viernes 8:00 AM - 5:00 PM'
      ]
    },
    {
      type: 'email',
      title: 'Correo Electrónico',
      details: [
        'atencionalciudadano@invima.gov.co',
        'Respuesta en 5 días hábiles',
        'Incluir número de registro en el asunto'
      ]
    },
    {
      type: 'office',
      title: 'Oficina Principal',
      details: [
        'Carrera 68D No. 17-11/21',
        'Bogotá D.C., Colombia',
        'Atención presencial con cita previa'
      ]
    },
    {
      type: 'online',
      title: 'Servicios en Línea',
      details: [
        'Portal web: www.invima.gov.co',
        'Consulta de trámites 24/7',
        'Chat en línea: Lunes a viernes 8:00 AM - 5:00 PM'
      ]
    }
  ];

  readonly usefulLinks: UsefulLink[] = [
    {
      title: 'Portal INVIMA',
      url: 'https://www.invima.gov.co'
    },
    {
      title: 'Consulta de Registros Sanitarios',
      url: 'https://www.invima.gov.co/consultas-publicas'
    },
    {
      title: 'Normatividad Vigente',
      url: 'https://www.invima.gov.co/normatividad'
    },
    {
      title: 'Guías y Documentos Técnicos',
      url: 'https://www.invima.gov.co/documentos-tecnicos'
    },
    {
      title: 'Estado de Trámites',
      url: 'https://tramiteslinea.invima.gov.co'
    },
    {
      title: 'Formularios y Formatos',
      url: 'https://www.invima.gov.co/formularios'
    }
  ];

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  downloadResolution(): void {
    // Simular descarga de resolución
    alert('Descargando resolución No. ' + this.resolutionData.resolutionNumber);
    console.log('Descargando resolución:', this.resolutionData.resolutionNumber);
  }

  downloadCertificate(): void {
    // Simular descarga de certificado
    alert('Descargando certificado de registro sanitario');
    console.log('Descargando certificado para registro:', this.resolutionData.registrationNumber);
  }

  startRenewalProcess(): void {
    alert('Redirigiendo al proceso de renovación de registro sanitario');
    console.log('Iniciando renovación para registro:', this.resolutionData.registrationNumber);
  }

  setRenewalReminder(): void {
    alert('Recordatorio configurado para 6 meses antes del vencimiento');
    console.log('Recordatorio configurado para registro:', this.resolutionData.registrationNumber);
  }

  getRenewalDeadline(): string {
    // Calcular fecha límite de renovación (6 meses antes del vencimiento)
    const expiryDate = new Date('2029-03-15');
    const renewalDeadline = new Date(expiryDate);
    renewalDeadline.setMonth(renewalDeadline.getMonth() - 6);

    return renewalDeadline.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getContactIcon(iconType: string): string {
    const icons: Record<string, string> = {
      phone: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>`,
      email: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>`,
      office: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>`,
      online: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c4.97 0 9-4.03 9-9s-4.03-9-9-9m0 18c-4.97 0-9-4.03-9-9s4.03-9 9-9m9 9a9 9 0 01-9 9" />
      </svg>`
    };
    return icons[iconType] || '';
  }

  // TrackBy functions para optimización
  trackByTab(index: number, tab: Tab): string {
    return tab.id;
  }

  trackByPresentation(index: number, presentation: string): string {
    return presentation;
  }

  trackByObligation(index: number, obligation: Obligation): string {
    return obligation.title;
  }

  trackByRequirement(index: number, requirement: CommercializationRequirement): string {
    return requirement.title;
  }

  trackByRenewalStep(index: number, step: RenewalStep): string {
    return step.title;
  }

  trackByContact(index: number, contact: ContactInfo): string {
    return contact.type;
  }

  trackByLink(index: number, link: UsefulLink): string {
    return link.url;
  }

  trackByString(index: number, item: string): string {
    return item;
  }
}
