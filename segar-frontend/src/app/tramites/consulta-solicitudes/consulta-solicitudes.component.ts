import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SolicitudService } from '../../core/services/solicitud.service';
import {
  Solicitud,
  EstadoSolicitud,
  TipoTramite,
  TIPO_TRAMITE_LABELS,
  ESTADO_SOLICITUD_LABELS
} from '../../core/DTOs/solicitud.dto';

@Component({
  standalone: true,
  selector: 'app-consulta-solicitudes',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './consulta-solicitudes.component.html',
  styleUrls: ['./consulta-solicitudes.component.css']
})
export class ConsultaSolicitudesComponent implements OnInit {
  consultaForm: FormGroup;

  // Estados del componente
  loading = false;

  // Datos
  solicitudes: Solicitud[] = [];
  solicitudSeleccionada?: Solicitud;

  // Filtros
  filtroActivo = 'todas';

  // Mensajes
  errorMessage = '';

  // Enums para el template
  readonly EstadoSolicitud = EstadoSolicitud;
  readonly TipoTramite = TipoTramite;
  readonly TipoTramiteLabels = TIPO_TRAMITE_LABELS;
  readonly EstadoSolicitudLabels = ESTADO_SOLICITUD_LABELS;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private router: Router
  ) {
    this.consultaForm = this.createForm();
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      empresaId: [67890, [Validators.min(1)]], // Valor por defecto para testing
      numeroRadicado: [''],
      estado: ['']
    });
  }

  async cargarSolicitudes(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';

      // Por defecto cargar solicitudes de la empresa de testing
      const empresaId = this.consultaForm.get('empresaId')?.value;
      if (empresaId) {
        this.solicitudes = await this.solicitudService.buscarSolicitudesPorEmpresa(empresaId).toPromise() || [];
      }

    } catch (error: any) {
      console.error('Error cargando solicitudes:', error);
      this.errorMessage = error.message || 'Error al cargar las solicitudes';
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  async onBuscarPorEmpresa(): Promise<void> {
    const empresaId = this.consultaForm.get('empresaId')?.value;
    if (!empresaId) {
      this.errorMessage = 'Ingrese un ID de empresa válido';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      this.solicitudes = await this.solicitudService.buscarSolicitudesPorEmpresa(empresaId).toPromise() || [];
      this.filtroActivo = 'empresa';
    } catch (error: any) {
      console.error('Error buscando por empresa:', error);
      this.errorMessage = error.message || 'Error al buscar solicitudes por empresa';
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  async onBuscarPorRadicado(): Promise<void> {
    const numeroRadicado = this.consultaForm.get('numeroRadicado')?.value?.trim();
    if (!numeroRadicado) {
      this.errorMessage = 'Ingrese un número de radicado válido';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      const solicitud = await this.solicitudService.buscarPorNumeroRadicado(numeroRadicado).toPromise();
      this.solicitudes = solicitud ? [solicitud] : [];
      this.filtroActivo = 'radicado';
    } catch (error: any) {
      console.error('Error buscando por radicado:', error);
      this.errorMessage = error.message || 'No se encontró ninguna solicitud con ese número de radicado';
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  async onBuscarPorEstado(): Promise<void> {
    const estado = this.consultaForm.get('estado')?.value as EstadoSolicitud;
    if (!estado) {
      this.errorMessage = 'Seleccione un estado válido';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      this.solicitudes = await this.solicitudService.buscarSolicitudesPorEstado(estado).toPromise() || [];
      this.filtroActivo = 'estado';
    } catch (error: any) {
      console.error('Error buscando por estado:', error);
      this.errorMessage = error.message || 'Error al buscar solicitudes por estado';
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  onVerDetalle(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
  }

  onCerrarDetalle(): void {
    this.solicitudSeleccionada = undefined;
  }

  onNuevaRadicacion(): void {
    this.router.navigate(['/tramites/registro/paso-cinco']);
  }

  onLimpiarBusqueda(): void {
    this.consultaForm.reset();
    this.consultaForm.patchValue({ empresaId: 67890 }); // Valor por defecto
    this.solicitudes = [];
    this.solicitudSeleccionada = undefined;
    this.errorMessage = '';
    this.filtroActivo = 'todas';
  }

  get solicitudesFiltradas(): Solicitud[] {
    return this.solicitudes;
  }

  get hayResultados(): boolean {
    return this.solicitudes.length > 0;
  }

  // Métodos para el template
  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoClass(estado: EstadoSolicitud): string {
    const classes = {
      [EstadoSolicitud.BORRADOR]: 'bg-gray-100 text-gray-800',
      [EstadoSolicitud.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [EstadoSolicitud.RADICADA]: 'bg-blue-100 text-blue-800',
      [EstadoSolicitud.RECHAZADA]: 'bg-red-100 text-red-800',
      [EstadoSolicitud.APROBADA]: 'bg-green-100 text-green-800'
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  }

  getTipoTramiteClass(tipo: TipoTramite): string {
    const classes = {
      [TipoTramite.REGISTRO]: 'bg-blue-100 text-blue-800',
      [TipoTramite.RENOVACION]: 'bg-orange-100 text-orange-800',
      [TipoTramite.MODIFICACION]: 'bg-purple-100 text-purple-800'
    };
    return classes[tipo] || 'bg-gray-100 text-gray-800';
  }
}
