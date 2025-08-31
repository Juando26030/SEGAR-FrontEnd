import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
  ResolucionService,
  Resolucion,
  RegistroSanitario,
  TramiteCompleto,
  HistorialTramite
} from '../../core/services/resolucion.service';

@Component({
  standalone: true,
  selector: 'app-resolucion-cumplimiento',
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './resolucion-cumplimiento.component.html',
  styleUrls: ['./resolucion-cumplimiento.component.css']
})
export class ResolucionCumplimientoComponent implements OnInit {
  // Estados del componente
  cargando = false;
  cargandoDescarga = false;
  tramiteId: number | null = null;

  // Datos del trámite
  tramiteCompleto: TramiteCompleto | null = null;
  resolucion: Resolucion | null = null;
  registroSanitario: RegistroSanitario | null = null;
  historial: HistorialTramite[] = [];

  // Estados del trámite
  tramiteAprobado = false;
  tramiteRechazado = false;
  tramiteFinalizado = false;

  // Mensajes
  errorMessage = '';
  mensajeExito = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private resolucionService: ResolucionService
  ) {}

  async ngOnInit(): Promise<void> {
    // Obtener ID del trámite desde la ruta
    this.tramiteId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.tramiteId || isNaN(this.tramiteId)) {
      this.errorMessage = 'ID de trámite no válido';
      return;
    }

    await this.cargarDatosTramite();
  }

  async cargarDatosTramite(): Promise<void> {
    if (!this.tramiteId) return;

    this.cargando = true;
    this.errorMessage = '';

    try {
      // Cargar información completa del trámite
      this.tramiteCompleto = await firstValueFrom(
        this.resolucionService.obtenerTramiteCompleto(this.tramiteId)
      );

      console.log('Trámite completo cargado:', this.tramiteCompleto);

      // Extraer datos específicos
      this.resolucion = this.tramiteCompleto.resolucion || null;
      this.registroSanitario = this.tramiteCompleto.registroSanitario || null;
      this.historial = this.tramiteCompleto.historial || [];

      // Determinar estado del trámite
      this.determinarEstadoTramite();

    } catch (error: any) {
      console.error('Error cargando datos del trámite:', error);
      this.errorMessage = error.message || 'Error al cargar la información del trámite';
    } finally {
      this.cargando = false;
    }
  }

  private determinarEstadoTramite(): void {
    if (!this.tramiteCompleto || !this.resolucion) {
      return;
    }

    // Determinar estado basado en la resolución
    switch (this.resolucion.estado) {
      case 'APROBADA':
        this.tramiteAprobado = true;
        this.tramiteRechazado = false;
        break;
      case 'RECHAZADA':
        this.tramiteAprobado = false;
        this.tramiteRechazado = true;
        break;
      default:
        this.tramiteAprobado = false;
        this.tramiteRechazado = false;
    }

    // Verificar si está finalizado
    this.tramiteFinalizado = this.tramiteCompleto.estado === 'FINALIZADA';
  }

  async descargarResolucion(): Promise<void> {
    if (!this.tramiteId) return;

    this.cargandoDescarga = true;

    try {
      const blob = await firstValueFrom(
        this.resolucionService.descargarResolucion(this.tramiteId)
      );

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resolucion_${this.resolucion?.numeroResolucion || this.tramiteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.mensajeExito = 'Resolución descargada exitosamente';

    } catch (error: any) {
      console.error('Error descargando resolución:', error);
      this.errorMessage = 'Error al descargar la resolución';
    } finally {
      this.cargandoDescarga = false;
    }
  }

  async descargarRegistroSanitario(): Promise<void> {
    if (!this.tramiteId || !this.registroSanitario) return;

    this.cargandoDescarga = true;

    try {
      const blob = await firstValueFrom(
        this.resolucionService.descargarRegistroSanitario(this.tramiteId)
      );

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Registro_Sanitario_${this.registroSanitario.numeroRegistro}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.mensajeExito = 'Registro sanitario descargado exitosamente';

    } catch (error: any) {
      console.error('Error descargando registro sanitario:', error);
      this.errorMessage = 'Error al descargar el registro sanitario';
    } finally {
      this.cargandoDescarga = false;
    }
  }

  async finalizarTramite(): Promise<void> {
    if (!this.tramiteId) return;

    try {
      await firstValueFrom(
        this.resolucionService.finalizarTramite(this.tramiteId)
      );

      this.tramiteFinalizado = true;
      this.mensajeExito = 'Trámite finalizado exitosamente';

      // Recargar datos para actualizar estado
      await this.cargarDatosTramite();

    } catch (error: any) {
      console.error('Error finalizando trámite:', error);
      this.errorMessage = 'Error al finalizar el trámite';
    }
  }

  // Método para formatear fechas
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para formatear solo fecha
  formatearSoloFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método para obtener clase CSS del estado
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'APROBADA':
      case 'VIGENTE':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADA':
      case 'VENCIDO':
      case 'SUSPENDIDO':
        return 'bg-red-100 text-red-800';
      case 'EN_REVISION':
        return 'bg-yellow-100 text-yellow-800';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Navegación
  volverATramites(): void {
    this.router.navigate(['/tramites']);
  }

  iniciarNuevoTramite(): void {
    this.router.navigate(['/tramites/registro/paso-uno']);
  }

  // Método para limpiar mensajes
  limpiarMensajes(): void {
    this.errorMessage = '';
    this.mensajeExito = '';
  }
}
