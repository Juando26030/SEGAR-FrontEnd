import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmpresaBackend } from './empresa.service';
import { DocumentoDisponible } from './documento.service';
import { PagoBackend } from './pago.service';
import { Producto, TipoTramite } from '../DTOs/solicitud.dto';

export interface TramiteEnProceso {
  // Datos del Paso 2
  empresa: EmpresaBackend | null;
  producto: Producto | null;
  tipoTramite: TipoTramite | null;

  // Datos del Paso 3
  documentosCargados: DocumentoDisponible[];
  documentosIds: number[];

  // Datos del Paso 4
  pago: PagoBackend | null;

  // Estado general
  pasoActual: number;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TramiteEstadoService {
  private tramiteState = new BehaviorSubject<TramiteEnProceso>({
    empresa: null,
    producto: null,
    tipoTramite: null,
    documentosCargados: [],
    documentosIds: [],
    pago: null,
    pasoActual: 1
  });

  public tramite$ = this.tramiteState.asObservable();

  constructor() {
    // Para pruebas, simular datos del trámite
    this.simularDatosParaPrueba();
  }

  // Método temporal para simular datos - QUITAR EN PRODUCCIÓN
  private simularDatosParaPrueba() {
    this.tramiteState.next({
      empresa: {
        id: 1001,
        nit: '900123456-7',
        razonSocial: 'Lácteos del Valle S.A.S.',
        telefono: '3001234567',
        email: 'contacto@lacteosdelvalle.com',
        direccion: 'Calle 123 #45-67, Bogotá',
        representanteLegal: 'María García López',
        estado: 'ACTIVA'
      },
      producto: {
        id: 2001,
        nombre: 'Yogurt Natural Premium',
        descripcion: 'Yogurt natural sin azúcar añadida',
        especificaciones: 'Contenido graso 3.5%, pH 4.2-4.6',
        referencia: 'YOG-NAT-001',
        fabricante: 'Lácteos del Valle S.A.S.'
      },
      tipoTramite: 'REGISTRO' as TipoTramite,
      documentosCargados: [
        { id: 1, nombre: 'Certificado de Constitución', tipo: 'LEGAL', requerido: true, descripcion: 'Documento legal de la empresa' },
        { id: 2, nombre: 'RUT', tipo: 'TRIBUTARIO', requerido: true, descripcion: 'Registro Único Tributario' },
        { id: 3, nombre: 'Concepto Sanitario', tipo: 'TECNICO', requerido: true, descripcion: 'Concepto técnico sanitario' }
      ],
      documentosIds: [1, 2, 3],
      pago: {
        id: 3001,
        numeroTransaccion: 'TXN-2025-001234',
        monto: 850000,
        moneda: 'COP',
        estado: 'APROBADO',
        metodoPago: 'PSE',
        fechaPago: '2025-01-28T14:30:00',
        descripcion: 'Pago registro sanitario - Yogurt Natural Premium',
        empresaId: 1001,
        tramiteId: 1
      },
      pasoActual: 5,
      observaciones: 'Producto premium para mercado nacional'
    });
  }

  // Actualizar datos del paso 2
  actualizarDatosPaso2(empresa: EmpresaBackend, producto: Producto, tipoTramite: TipoTramite) {
    const current = this.tramiteState.value;
    this.tramiteState.next({
      ...current,
      empresa,
      producto,
      tipoTramite,
      pasoActual: 2
    });
  }

  // Actualizar datos del paso 3
  actualizarDatosPaso3(documentos: DocumentoDisponible[], documentosIds: number[]) {
    const current = this.tramiteState.value;
    this.tramiteState.next({
      ...current,
      documentosCargados: documentos,
      documentosIds,
      pasoActual: 3
    });
  }

  // Actualizar datos del paso 4
  actualizarDatosPaso4(pago: PagoBackend) {
    const current = this.tramiteState.value;
    this.tramiteState.next({
      ...current,
      pago,
      pasoActual: 4
    });
  }

  // Actualizar observaciones
  actualizarObservaciones(observaciones: string) {
    const current = this.tramiteState.value;
    this.tramiteState.next({
      ...current,
      observaciones
    });
  }

  // Obtener estado actual
  getTramiteActual(): TramiteEnProceso {
    return this.tramiteState.value;
  }

  // Verificar si el trámite está completo para radicar
  esTramiteCompleto(): boolean {
    const tramite = this.tramiteState.value;
    return !!(tramite.empresa &&
              tramite.producto &&
              tramite.tipoTramite &&
              tramite.documentosIds.length > 0 &&
              tramite.pago);
  }

  // Limpiar estado (para nuevo trámite)
  limpiarEstado() {
    this.tramiteState.next({
      empresa: null,
      producto: null,
      tipoTramite: null,
      documentosCargados: [],
      documentosIds: [],
      pago: null,
      pasoActual: 1
    });
  }
}
