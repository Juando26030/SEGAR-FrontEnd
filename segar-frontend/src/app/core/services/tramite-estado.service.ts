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
  estado?: string;
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
        id: 1002,
        nit: '123456789',
        razonSocial: 'Empresa de Prueba S.A.S.',
        email: 'contacto@empresa.com',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        representanteLegal: 'Juan Pérez',
        estado: 'ACTIVA'
      },
      producto: {
        id: 2,
        nombre: 'Mermelada de Fresa',
        referencia: 'MER-001',
        descripcion: 'Mermelada artesanal de fresa',
        especificaciones: 'Especificaciones técnicas del producto',
        fabricante: 'Fábrica de Alimentos S.A.'
      },
      tipoTramite: TipoTramite.REGISTRO,
      documentosCargados: [],
      documentosIds: [6, 7, 8, 9, 10],
      pago: {
        id: 2,
        numeroTransaccion: 'PSE-20240820-001',
        monto: 450000,
        moneda: 'COP',
        estado: 'APROBADO',
        metodoPago: 'PSE',
        fechaPago: '2024-08-20T10:30:00',
        descripcion: 'Pago trámite registro sanitario',
        empresaId: 1002,
        tramiteId: 1
      },
      pasoActual: 5,
      estado: 'EN_PROCESO'
    });
  }

  // Obtener estado actual
  getTramiteActual(): TramiteEnProceso {
    return this.tramiteState.getValue();
  }

  // Actualizar trámite con datos parciales
  actualizarTramite(tramite: Partial<TramiteEnProceso>): void {
    const tramiteActual = this.tramiteState.getValue();
    this.tramiteState.next({ ...tramiteActual, ...tramite });
  }

  // Actualizar estado del trámite
  actualizarEstado(estado: string): void {
    const tramiteActual = this.tramiteState.getValue();
    this.tramiteState.next({ ...tramiteActual, estado });
  }

  // Limpiar estado (para nuevo trámite)
  limpiarTramite(): void {
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

  // Verificar si el trámite está completo para radicar
  esTramiteCompleto(): boolean {
    const tramite = this.tramiteState.getValue();
    return !!(tramite.empresa &&
              tramite.producto &&
              tramite.tipoTramite &&
              tramite.documentosIds.length > 0 &&
              tramite.pago);
  }

  // Avanzar al siguiente paso
  avanzarPaso(): void {
    const tramiteActual = this.tramiteState.getValue();
    this.tramiteState.next({ ...tramiteActual, pasoActual: tramiteActual.pasoActual + 1 });
  }

  // Retroceder al paso anterior
  retrocederPaso(): void {
    const tramiteActual = this.tramiteState.getValue();
    if (tramiteActual.pasoActual > 1) {
      this.tramiteState.next({ ...tramiteActual, pasoActual: tramiteActual.pasoActual - 1 });
    }
  }

  // Establecer el paso actual
  setPasoActual(paso: number): void {
    const tramiteActual = this.tramiteState.getValue();
    this.tramiteState.next({ ...tramiteActual, pasoActual: paso });
  }
}
