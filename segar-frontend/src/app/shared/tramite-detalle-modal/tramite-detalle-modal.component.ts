import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, TramiteDetalleDTO } from '../../core/services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-tramite-detalle-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramite-detalle-modal.component.html',
  styleUrls: ['./tramite-detalle-modal.component.css']
})
export class TramiteDetalleModalComponent implements OnChanges {
  @Input() tramiteId: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  detalle: TramiteDetalleDTO | null = null;
  activeTab: string = 'eventos';
  isLoading: boolean = false;
  error: string | null = null;

  token = '';

  constructor(private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.token = this.authService.getToken()!;
    if (changes['tramiteId'] && this.tramiteId && this.isVisible) {
      this.cargarDetalle();
    }

    if (changes['isVisible'] && this.isVisible && this.tramiteId) {
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {
    if (!this.tramiteId) return;

    this.isLoading = true;
    this.error = null;

    console.log('Cargando detalle para trámite ID:', this.tramiteId);

    this.dashboardService.getTramiteDetalle(this.token, this.tramiteId).subscribe({
      next: (detalle: TramiteDetalleDTO) => {
        console.log('Detalle del trámite recibido:', detalle);
        this.detalle = detalle;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando detalle del trámite:', error);
        this.error = 'Error al cargar los detalles del trámite';
        this.isLoading = false;
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.detalle = null;
    this.error = null;
  }

  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'RADICADO': 'estado-activo',
      'EN_EVALUACION_TECNICA': 'estado-activo',
      'REQUIERE_INFORMACION': 'estado-pendiente',
      'APROBADO': 'estado-completado',
      'RECHAZADO': 'estado-vencido'
    };
    return estadoMap[estado] || 'estado-pendiente';
  }

  mapearEstado(estado: string): string {
    return this.dashboardService.mapearEstado(estado);
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

  getDaysRemainingClass(diasRestantes: number): string {
    if (diasRestantes <= 0) return 'expired';
    if (diasRestantes <= 3) return 'urgent';
    if (diasRestantes <= 7) return 'warning';
    return 'normal';
  }

}
