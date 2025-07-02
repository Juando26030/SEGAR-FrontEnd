import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-registro-paso-cinco',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-cinco.component.html',
  styleUrls: ['./registro-paso-cinco.component.css']
})
export class RegistroPasoCincoComponent {
  activeTab = 'resolucion';

  // Datos de la resolución aprobada
  resolucion = {
    numero: '2023-12345',
    fechaExpedicion: '15 de Mayo de 2023',
    fechaVencimiento: '15 de Mayo de 2028',
    numeroRadicado: 'INV-2023-45678',
    vigencia: '5 años',
    estado: 'aprobado',
    productosAutorizados: [
      'Galletas Integrales con Avena y Miel - 250g',
      'Galletas Integrales con Semillas - 200g',
      'Galletas Integrales sin Azúcar - 180g'
    ],
    numeroRegistro: 'RSAV12345678'
  };

  // Información de renovación
  renovacionInfo = {
    fechaVencimiento: '15/05/2028',
    tiempoRestante: '4 años, 11 meses',
    fechaRenovacionRecomendada: '15/11/2027'
  };

  // Notificaciones de renovación
  notificacionesRenovacion = [
    {
      tipo: 'warning',
      titulo: 'Próxima renovación',
      mensaje: 'Su registro vence en 6 meses. Es recomendable iniciar el proceso de renovación.',
      fecha: '2024-11-15',
      activa: false
    }
  ];

  // Recursos adicionales
  recursosAdicionales = [
    {
      titulo: 'Guía de etiquetado nutricional',
      descripcion: 'Normativas actualizadas para el etiquetado de productos alimentarios',
      url: '#'
    },
    {
      titulo: 'Normativa vigente para alimentos',
      descripcion: 'Reglamentación sanitaria actualizada del INVIMA',
      url: '#'
    },
    {
      titulo: 'Preguntas frecuentes',
      descripcion: 'Respuestas a consultas comunes sobre registros sanitarios',
      url: '#'
    },
    {
      titulo: 'Contactar a soporte técnico',
      descripcion: 'Asistencia especializada para dudas técnicas',
      url: '#'
    }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onDescargarResolucion() {
    // Simular descarga de resolución
    const blob = new Blob(['Contenido de la resolución oficial...'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resolucion_${this.resolucion.numero}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    alert('Descargando resolución oficial...');
  }

  onImprimirCertificado() {
    // Simular impresión de certificado
    window.print();
    alert('Preparando certificado para impresión...');
  }

  onDescargarCertificado() {
    // Simular descarga de certificado
    const blob = new Blob(['Contenido del certificado...'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificado_${this.resolucion.numeroRegistro}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    alert('Descargando certificado de registro sanitario...');
  }

  onConfigurarRecordatorios() {
    alert('Recordatorios de renovación configurados correctamente. Recibirá notificaciones 6 meses antes del vencimiento.');
  }

  onProgramarRenovacion() {
    alert('Proceso de renovación programado. Se le notificará cuando sea el momento adecuado para iniciar el trámite.');
  }

  onContactarSoporte() {
    alert('Redirigiendo al centro de soporte técnico especializado...');
  }

  onAccederRecurso(recurso: any) {
    alert(`Accediendo a: ${recurso.titulo}`);
  }

  onFinalizarProceso() {
    alert('¡Proceso completado exitosamente! Su registro sanitario está activo y listo para usar. Recuerde mantener actualizada su información ante el INVIMA.');
  }

  onVolverAlInicio() {
    alert('Volviendo al inicio del sistema...');
  }

  // Métodos para renovación
  onIniciarRenovacion() {
    alert('Iniciando proceso de renovación. Será redirigido al formulario correspondiente.');
  }

  onValidarVigencia() {
    const fechaVencimiento = new Date('2028-05-15');
    const fechaActual = new Date();
    const tiempoRestante = fechaVencimiento.getTime() - fechaActual.getTime();
    const diasRestantes = Math.ceil(tiempoRestante / (1000 * 3600 * 24));

    if (diasRestantes > 0) {
      alert(`Su registro está vigente. Días restantes: ${diasRestantes}`);
    } else {
      alert('Su registro ha vencido. Debe iniciar el proceso de renovación inmediatamente.');
    }
  }

  onGenerarQR() {
    alert('Código QR generado para verificación del registro sanitario.');
  }

  onCompartirCertificado() {
    if (navigator.share) {
      navigator.share({
        title: 'Certificado de Registro Sanitario',
        text: `Certificado No. ${this.resolucion.numeroRegistro}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores sin soporte de Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Enlace copiado al portapapeles');
      });
    }
  }

  // Calcular progreso de vigencia
  getProgresoVigencia(): number {
    const fechaExpedicion = new Date('2023-05-15');
    const fechaVencimiento = new Date('2028-05-15');
    const fechaActual = new Date();

    const tiempoTotal = fechaVencimiento.getTime() - fechaExpedicion.getTime();
    const tiempoTranscurrido = fechaActual.getTime() - fechaExpedicion.getTime();

    return Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));
  }

  // Determinar si necesita renovación pronto
  necesitaRenovacionProxima(): boolean {
    const fechaVencimiento = new Date('2028-05-15');
    const fechaActual = new Date();
    const seiseMesesEnMs = 6 * 30 * 24 * 60 * 60 * 1000; // Aproximadamente 6 meses

    return (fechaVencimiento.getTime() - fechaActual.getTime()) <= seiseMesesEnMs;
  }
}
