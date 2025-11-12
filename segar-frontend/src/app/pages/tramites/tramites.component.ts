import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TramiteService } from '../../core/services/tramite.service';
import { DocumentService } from "../../core/services/document.service";
import { AuthService } from '../../auth/services/auth.service';
import { DashboardService, TramiteDetalleDTO } from '../../core/services/dashboard.service';


@Component({
  selector: 'app-tramites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {
  tramites: any[] = [];
  cargando = false;
  error: string | null = null;
  cantidadAprobados: number = 0;


  mostrarModal: boolean = false;
  documentos: Array<{ nombre: string }> = [];
  tramiteSeleccionado: any = null; // Variable para almacenar el trámite seleccionado
  tramiteDetalle: TramiteDetalleDTO | null = null; // Detalle completo del trámite desde dashboard
  tabActiva: 'informacion' | 'documentos' = 'informacion'; // Pestaña activa del modal

  constructor(
    private tramiteService: TramiteService,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.obtenerTramites();
  }

  editarTramite(tramite: any, event: Event): void {
    event.stopPropagation();

    // Determinar a qué paso redirigir según el estado
    const estado = tramite.currentStatus?.toLowerCase() || '';
    console.log("El estado del tramite es:" + estado)
    console.log('Estructura del trámite:', tramite);

    if (estado === 'radicado' || estado === 'en_evaluacion_tecnica' || estado === 'requiere_informacion') {
      // Si está en proceso o pendiente, va al paso 2
      this.router.navigate(['/main/nuevo/registro/paso-2', tramite.id]);

    } else if (estado === 'aprobado' || estado === 'rechazado' || estado === 'completado') {
      // Si está aprobado o completado, va al paso 3
      this.router.navigate(['/main/nuevo/registro/paso-3', tramite.id]);

    } else {
      // Por defecto, va al paso 2
      this.router.navigate(['/main/nuevo/registro/paso-2', tramite.id]);

    }
  }



  obtenerTramites() {
    this.cargando = true;
    this.error = null;

    this.tramiteService.getAllTramites().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
        for (let tramite of data) {
          if (Array.isArray(tramite.eventos) && tramite.eventos.length > 3) {
            const evento = tramite.eventos[3];
            if (evento.completed === true && evento.currentEvent === true) {
              this.cantidadAprobados++;
            }
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener tramites:', err);
        this.error = 'No se pudieron cargar los tramites.';
        this.cargando = false;
      }
    });
  }

  irANuevoTramite() {
    this.router.navigate(['main/nuevo/tramite']);
  }

  abrirModal(documentos: Array<{ nombre: string }>, tramite: any) {
    console.log('Trámite seleccionado:', tramite);
    this.tramiteSeleccionado = tramite;
    this.documentos = documentos;
    this.tabActiva = 'informacion'; // Resetear a la primera pestaña
    this.mostrarModal = true;

    // Cargar detalle completo del trámite desde dashboard service
    if (tramite.id) {
      this.cargando = true;
      this.dashboardService.getTramiteDetalle(tramite.id).subscribe({
        next: (detalle: TramiteDetalleDTO) => {
          console.log('Detalle del trámite desde dashboard:', detalle);
          this.tramiteDetalle = detalle;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar detalle del trámite:', err);
          this.cargando = false;
        }
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.documentos = [];
    this.tramiteDetalle = null;
  }

  mapearEstado(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'RADICADO': 'Radicado',
      'EN_EVALUACION_TECNICA': 'En Evaluación Técnica',
      'REQUIERE_INFORMACION': 'Requiere Información',
      'APROBADO': 'Aprobado',
      'RECHAZADO': 'Rechazado'
    };
    return estadoMap[estado] || estado;
  }

  extraerTipoProceso(procedureType: string): string {
    if (!procedureType) return '';
    const partes = procedureType.split(' - ');
    return partes[0] || procedureType;
  }

  extraerRiesgoAlimento(procedureType: string): string {
    if (!procedureType) return '';
    const partes = procedureType.split(' - ');
    if (partes.length > 1) {
      const parteDespuesGuion = partes[1];
      const palabras = parteDespuesGuion.split(' ');
      return palabras[palabras.length - 1] || '';
    }
    return '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'RADICADO': 'bg-blue-100 text-blue-800',
      'EN_EVALUACION_TECNICA': 'bg-blue-100 text-blue-800',
      'REQUIERE_INFORMACION': 'bg-yellow-100 text-yellow-800',
      'APROBADO': 'bg-green-100 text-green-800',
      'RECHAZADO': 'bg-red-100 text-red-800'
    };
    return estadoMap[estado] || 'bg-gray-100 text-gray-800';
  }

  getHeaderColorClass(estado: string): string {
    const upperEstado = estado?.toUpperCase() || '';

    if (upperEstado === 'APROBADO') {
      return 'from-green-500 to-green-600';
    } else if (upperEstado === 'RECHAZADO') {
      return 'from-red-500 to-red-600';
    }
    return 'from-blue-600 to-blue-700';
  }

  getBorderColorClass(estado: string): string {
    const upperEstado = estado?.toUpperCase() || '';

    if (upperEstado === 'APROBADO') {
      return 'border-green-300 hover:border-green-500';
    } else if (upperEstado === 'RECHAZADO') {
      return 'border-red-300 hover:border-red-500';
    }
    return 'border-blue-300 hover:border-blue-500';
  }

  getBorderLeftColorClass(estado: string): string {
    const upperEstado = estado?.toUpperCase() || '';

    if (upperEstado === 'APROBADO') {
      return 'border-green-500';
    } else if (upperEstado === 'RECHAZADO') {
      return 'border-red-500';
    }
    return 'border-blue-500';
  }

  onDocumentoClick(documento: any) {
    console.log('Documento seleccionado:', documento);
    const token = this.authService.getToken();
    this.documentService.getSignedUrl(documento.bucketName, documento.objectName, documento.contentType, token!).subscribe({
      next: (response: string) => {
        // Si la respuesta es directamente la URL
        window.open(response, '_blank');
      },
      error: (err) => {
        console.error('Error al obtener la URL firmada del documento:', err);
        alert('No se pudo abrir el documento.');
      }
    });
  }
}
