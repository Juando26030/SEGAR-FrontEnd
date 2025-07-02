import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-registro-paso-cuatro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-cuatro.component.html',
  styleUrls: ['./registro-paso-cuatro.component.css']
})
export class RegistroPasoCuatroComponent {
  activeTab = 'estado';
  uploading = false;
  uploadProgress = 0;
  success = false;

  tramites = [
    {
      id: 'INV-2023-45123',
      nombre: 'Yogurt Natural Premium',
      fecha: '15/03/2023',
      estado: 'revision',
      progreso: 65,
      etapaActual: 'Evaluación técnica'
    },
    {
      id: 'INV-2023-32145',
      nombre: 'Leche Deslactosada UHT',
      fecha: '10/05/2023',
      estado: 'requerimiento',
      progreso: 40,
      etapaActual: 'Pendiente documentación'
    },
    {
      id: 'INV-2023-28934',
      nombre: 'Queso Mozzarella',
      fecha: '05/02/2023',
      estado: 'aprobado',
      progreso: 100,
      etapaActual: 'Proceso finalizado'
    }
  ];

  notificaciones = [
    {
      tipo: 'requerimiento',
      mensaje: 'Nuevo requerimiento para trámite INV-2023-32145',
      fecha: '2 horas'
    },
    {
      tipo: 'aprobacion',
      mensaje: 'Registro sanitario aprobado para INV-2023-28934',
      fecha: '1 día'
    },
    {
      tipo: 'info',
      mensaje: 'Recordatorio: Vencimiento de requerimiento en 5 días',
      fecha: '3 días'
    }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'status-pending';
      case 'revision': return 'status-review';
      case 'requerimiento': return 'status-pending';
      case 'aprobado': return 'status-approved';
      case 'rechazado': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'revision': return 'En revisión';
      case 'requerimiento': return 'Requerimiento';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return 'Pendiente';
    }
  }

  getNotificationClass(tipo: string): string {
    switch (tipo) {
      case 'requerimiento': return 'bg-yellow-100 text-yellow-600';
      case 'aprobacion': return 'bg-green-100 text-green-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getNotificationIcon(tipo: string): string {
    switch (tipo) {
      case 'requerimiento': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z';
      case 'aprobacion': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  onResponderRequerimiento(id: string) {
    alert(`Abriendo requerimiento para trámite: ${id}`);
  }

  onDescargarResolucion(id: string) {
    alert(`Descargando resolución para trámite: ${id}`);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploading = true;
      this.uploadProgress = 0;

      // Simular proceso de carga
      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          this.uploading = false;
          this.success = true;
        }
      }, 200);
    }
  }

  onConsultarEstado() {
    alert('Función de consulta de estado implementada');
  }

  onDescargarCertificados() {
    alert('Función de descarga de certificados implementada');
  }

  onContactarSoporte() {
    alert('Conectando con soporte técnico...');
  }
}
