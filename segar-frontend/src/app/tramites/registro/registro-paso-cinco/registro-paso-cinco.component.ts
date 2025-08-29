import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SolicitudService } from '../../../core/services/solicitud.service';
import { ValidacionService, ValidacionCompletaResponse } from '../../../core/services/validacion.service';
import { TramiteEstadoService, TramiteEnProceso } from '../../../core/services/tramite-estado.service';
import {
  RadicacionSolicitudDTO,
  RadicacionResponse,
  TIPO_TRAMITE_LABELS
} from '../../../core/DTOs/solicitud.dto';

interface EstadoValidacion {
  tipo: 'empresa' | 'documentos' | 'pago';
  titulo: string;
  mensaje: string;
  estado: 'pendiente' | 'validando' | 'exitoso' | 'error';
  icono: string;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-registro-paso-cinco',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './registro-paso-cinco.component.html',
  styleUrls: ['./registro-paso-cinco.component.css']
})
export class RegistroPasoCincoComponent implements OnInit {
  observacionesForm: FormGroup;

  // Estados del componente
  cargando = false;
  validacionesCompletas = false;
  solicitudRadicada = false;
  mostrarResumen = true;

  // Datos del trámite
  tramiteActual: TramiteEnProceso | null = null;
  solicitudRadicadaData: RadicacionResponse | null = null;
  numeroRadicado = '';
  fechaRadicacion = '';

  // Estado de validaciones
  estadoValidaciones: EstadoValidacion[] = [
    {
      tipo: 'empresa',
      titulo: 'Validación de Empresa',
      mensaje: 'Verificando registro y estado de la empresa...',
      estado: 'pendiente',
      icono: 'fas fa-building',
      color: '#6c757d'
    },
    {
      tipo: 'documentos',
      titulo: 'Validación de Documentos',
      mensaje: 'Verificando documentos obligatorios...',
      estado: 'pendiente',
      icono: 'fas fa-file-alt',
      color: '#6c757d'
    },
    {
      tipo: 'pago',
      titulo: 'Validación de Pago',
      mensaje: 'Verificando pago aprobado...',
      estado: 'pendiente',
      icono: 'fas fa-credit-card',
      color: '#6c757d'
    }
  ];

  // Mensaje de estado
  errorMessage = '';
  mensajeExito = '';

  // Labels para la UI
  tipoTramiteLabels = TIPO_TRAMITE_LABELS;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private solicitudService: SolicitudService,
    private validacionService: ValidacionService,
    private tramiteEstadoService: TramiteEstadoService
  ) {
    this.observacionesForm = this.fb.group({
      observaciones: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarTramiteEnProceso();
    if (this.tramiteActual) {
      await this.ejecutarValidacionesPrevias();
    }
  }

  private async cargarTramiteEnProceso(): Promise<void> {
    // Obtener el trámite que se viene trabajando desde los pasos anteriores
    this.tramiteActual = this.tramiteEstadoService.getTramiteActual();

    // Verificar que el trámite esté completo
    if (!this.tramiteEstadoService.esTramiteCompleto()) {
      this.errorMessage = 'El trámite no está completo. Por favor complete todos los pasos anteriores.';
      return;
    }

    // Cargar observaciones previas si existen
    if (this.tramiteActual?.observaciones) {
      this.observacionesForm.patchValue({
        observaciones: this.tramiteActual.observaciones
      });
    }

    console.log('Trámite cargado para radicación:', this.tramiteActual);
  }

  async ejecutarValidacionesPrevias(): Promise<void> {
    if (!this.tramiteActual) return;

    this.cargando = true;
    this.errorMessage = '';
    this.mensajeExito = '';

    try {
      // 1. Validación de Empresa
      await this.validarEmpresa();

      // 2. Validación de Documentos
      await this.validarDocumentos();

      // 3. Validación de Pago
      await this.validarPago();

      // 4. Validación Completa
      await this.validacionCompleta();

    } catch (error: any) {
      console.error('Error en validaciones previas:', error);
      this.errorMessage = error.message || 'Error en las validaciones previas';
    } finally {
      this.cargando = false;
    }
  }

  private async validarEmpresa(): Promise<void> {
    const validacionEmpresa = this.estadoValidaciones.find(v => v.tipo === 'empresa')!;
    validacionEmpresa.estado = 'validando';
    validacionEmpresa.mensaje = 'Validando empresa...';
    validacionEmpresa.icono = 'fas fa-spinner fa-spin';
    validacionEmpresa.color = '#007bff';

    try {
      const resultado = await this.validacionService
        .validarEmpresa(this.tramiteActual!.empresa!.id).toPromise();

      if (resultado?.registrada && resultado.estado === 'ACTIVA') {
        validacionEmpresa.estado = 'exitoso';
        validacionEmpresa.mensaje = `✓ Empresa registrada y activa: ${this.tramiteActual!.empresa!.razonSocial}`;
        validacionEmpresa.icono = 'fas fa-check-circle';
        validacionEmpresa.color = '#28a745';
      } else {
        throw new Error(resultado?.mensaje || 'Empresa no registrada o inactiva');
      }
    } catch (error: any) {
      validacionEmpresa.estado = 'error';
      validacionEmpresa.mensaje = `✗ ${error.message}`;
      validacionEmpresa.icono = 'fas fa-times-circle';
      validacionEmpresa.color = '#dc3545';
      throw error;
    }
  }

  private async validarDocumentos(): Promise<void> {
    const validacionDocumentos = this.estadoValidaciones.find(v => v.tipo === 'documentos')!;
    validacionDocumentos.estado = 'validando';
    validacionDocumentos.mensaje = 'Validando documentos...';
    validacionDocumentos.icono = 'fas fa-spinner fa-spin';
    validacionDocumentos.color = '#007bff';

    try {
      const resultado = await this.validacionService
        .validarDocumentos({
          empresaId: this.tramiteActual!.empresa!.id,
          documentosId: this.tramiteActual!.documentosIds
        }).toPromise();

      if (resultado?.documentosCompletos) {
        validacionDocumentos.estado = 'exitoso';
        validacionDocumentos.mensaje = `✓ Documentos completos (${resultado.totalDocumentos} documentos)`;
        validacionDocumentos.icono = 'fas fa-check-circle';
        validacionDocumentos.color = '#28a745';
      } else {
        throw new Error(`Faltan documentos: ${resultado?.documentosFaltantes.join(', ')}`);
      }
    } catch (error: any) {
      validacionDocumentos.estado = 'error';
      validacionDocumentos.mensaje = `✗ ${error.message}`;
      validacionDocumentos.icono = 'fas fa-times-circle';
      validacionDocumentos.color = '#dc3545';
      throw error;
    }
  }

  private async validarPago(): Promise<void> {
    const validacionPago = this.estadoValidaciones.find(v => v.tipo === 'pago')!;
    validacionPago.estado = 'validando';
    validacionPago.mensaje = 'Validando pago...';
    validacionPago.icono = 'fas fa-spinner fa-spin';
    validacionPago.color = '#007bff';

    try {
      const resultado = await this.validacionService
        .validarPago(this.tramiteActual!.pago!.id).toPromise();

      if (resultado?.pagoValido && resultado.estado === 'APROBADO') {
        validacionPago.estado = 'exitoso';
        validacionPago.mensaje = `✓ Pago aprobado: $${resultado.monto.toLocaleString('es-CO')} COP`;
        validacionPago.icono = 'fas fa-check-circle';
        validacionPago.color = '#28a745';
      } else {
        throw new Error(resultado?.mensaje || 'Pago no encontrado o no aprobado');
      }
    } catch (error: any) {
      validacionPago.estado = 'error';
      validacionPago.mensaje = `✗ ${error.message}`;
      validacionPago.icono = 'fas fa-times-circle';
      validacionPago.color = '#dc3545';
      throw error;
    }
  }

  private async validacionCompleta(): Promise<void> {
    try {
      const resultado = await this.validacionService
        .validacionCompleta({
          empresaId: this.tramiteActual!.empresa!.id,
          documentosId: this.tramiteActual!.documentosIds,
          pagoId: this.tramiteActual!.pago!.id
        }).toPromise();

      if (resultado?.puedeRadicar) {
        this.validacionesCompletas = true;
        this.mensajeExito = '✅ Todas las validaciones completadas. Puede proceder con la radicación.';
      } else {
        throw new Error(resultado?.mensaje || 'No se pueden completar las validaciones');
      }
    } catch (error: any) {
      this.validacionesCompletas = false;
      throw error;
    }
  }

  async radicarSolicitud(): Promise<void> {
    if (!this.tramiteActual || !this.validacionesCompletas) {
      this.errorMessage = 'Complete las validaciones previas antes de radicar';
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    try {
      // Actualizar observaciones si se modificaron
      const observaciones = this.observacionesForm.get('observaciones')?.value;
      if (observaciones !== this.tramiteActual.observaciones) {
        this.tramiteEstadoService.actualizarObservaciones(observaciones);
        this.tramiteActual = this.tramiteEstadoService.getTramiteActual();
      }

      // Crear solicitud de radicación
      const solicitudData: RadicacionSolicitudDTO = {
        empresaId: this.tramiteActual.empresa!.id,
        productoId: this.tramiteActual.producto!.id,
        tipoTramite: this.tramiteActual.tipoTramite!,
        documentosId: this.tramiteActual.documentosIds,
        pagoId: this.tramiteActual.pago!.id,
        observaciones: this.tramiteActual.observaciones || ''
      };

      console.log('Radicando solicitud:', solicitudData);

      // Llamar al servicio de radicación
      const respuesta = await this.solicitudService.radicarSolicitud(solicitudData).toPromise();

      if (respuesta) {
        // ÉXITO EN LA RADICACIÓN
        this.solicitudRadicada = true;
        this.solicitudRadicadaData = respuesta;
        this.numeroRadicado = respuesta.numeroRadicado;
        this.fechaRadicacion = respuesta.fechaRadicacion;
        this.mostrarResumen = false;

        console.log('Solicitud radicada exitosamente:', respuesta);

        // Scroll hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error: any) {
      console.error('Error al radicar solicitud:', error);
      this.manejarErrorRadicacion(error);
    } finally {
      this.cargando = false;
    }
  }

  private manejarErrorRadicacion(error: any): void {
    if (error.message.includes('DOCUMENTOS_INCOMPLETOS')) {
      this.errorMessage = '❌ Documentos incompletos. Verifique que todos los documentos obligatorios estén cargados.';
    } else if (error.message.includes('PAGO_INVALIDO')) {
      this.errorMessage = '❌ Pago inválido. Verifique que el pago esté aprobado.';
    } else if (error.message.includes('SOLICITUD_DUPLICADA')) {
      this.errorMessage = '❌ Ya existe una solicitud radicada para este producto y tipo de trámite.';
    } else {
      this.errorMessage = error.message || '❌ Error al radicar la solicitud. Intente nuevamente.';
    }
  }

  // Métodos de navegación
  volver(): void {
    this.router.navigate(['/tramites/registro/paso-cuatro']);
  }

  volverAPasos(): void {
    this.router.navigate(['/tramites/registro/paso-dos']);
  }

  descargarComprobante(): void {
    if (this.solicitudRadicadaData) {
      const contenido = `
COMPROBANTE DE RADICACIÓN - SEGAR
=================================

Número de Radicado: ${this.solicitudRadicadaData.numeroRadicado}
Fecha de Radicación: ${new Date(this.solicitudRadicadaData.fechaRadicacion).toLocaleString('es-CO')}
Producto: ${this.solicitudRadicadaData.nombreProducto}
Tipo de Trámite: ${this.tipoTramiteLabels[this.solicitudRadicadaData.tipoTramite]}
Estado: ${this.solicitudRadicadaData.estado}

Empresa: ${this.tramiteActual?.empresa?.razonSocial}
NIT: ${this.tramiteActual?.empresa?.nit}

${this.solicitudRadicadaData.observaciones ? 'Observaciones: ' + this.solicitudRadicadaData.observaciones : ''}

Mensaje del Sistema: ${this.solicitudRadicadaData.mensaje}

----------------------------------
Este documento certifica que su solicitud ha sido radicada exitosamente.
Conserve este número de radicado para futuras consultas.

Generado el: ${new Date().toLocaleString('es-CO')}
      `;

      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Comprobante-${this.solicitudRadicadaData.numeroRadicado}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  nuevaSolicitud(): void {
    this.tramiteEstadoService.limpiarEstado();
    this.router.navigate(['/tramites/registro/paso-uno']);
  }

  irAConsultas(): void {
    this.router.navigate(['/tramites/consulta-solicitudes']);
  }

  reiniciarValidaciones(): void {
    this.validacionesCompletas = false;
    this.errorMessage = '';
    this.mensajeExito = '';

    // Resetear estado de validaciones
    this.estadoValidaciones.forEach(validacion => {
      validacion.estado = 'pendiente';
      validacion.mensaje = 'Pendiente de validación...';
      validacion.icono = 'fas fa-clock';
      validacion.color = '#6c757d';
    });

    this.ejecutarValidacionesPrevias();
  }
}
