import { TestBed } from '@angular/core/testing';
import { TramiteEstadoService, TramiteEnProceso } from './tramite-estado.service';
import { TipoTramite } from '../DTOs/solicitud.dto';
import { EmpresaBackend } from './empresa.service';
import { Producto } from '../DTOs/solicitud.dto';
import { PagoBackend } from './pago.service';
import { DocumentoDisponible } from './documento.service';

describe('TramiteEstadoService', () => {
  let service: TramiteEstadoService = null as any;

  const mockEmpresa: EmpresaBackend  = {
    id: 1002,
    nit: '123456789',
    razonSocial: 'Empresa Test S.A.S.',
    email: 'test@empresa.com',
    telefono: '3001234567',
    direccion: 'Calle 123 #45-67',
    representanteLegal: 'Juan Pérez',
    estado: 'ACTIVA'
  };

  const mockProducto: Producto  = {
    id: 1,
    nombre: 'Producto Test',
    referencia: 'REF-001',
    descripcion: 'Descripción del producto test',
    especificaciones: 'Especificaciones técnicas',
    fabricante: 'Fabricante Test S.A.'
  };

  const mockPago: PagoBackend  = {
    id: 1,
    numeroTransaccion: 'PSE-20240101-001',
    monto: 450000,
    moneda: 'COP',
    estado: 'APROBADO',
    metodoPago: 'PSE',
    fechaPago: '2024-01-01T10:00:00',
    descripcion: 'Pago de trámite',
    empresaId: 1002,
    tramiteId: 1
  };

  const mockDocumento: DocumentoDisponible  = {
    id: 1,
    nombre: 'Certificado de Existencia',
    tipo: 'LEGAL',
    requerido: true,
    descripcion: 'Certificado expedido por Cámara de Comercio'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TramiteEstadoService]
    });
    service = TestBed.inject(TramiteEstadoService);
  });

  // ==================== TESTS DE INICIALIZACIÓN ====================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default empty state', (done) => {
    // Arrange & Act
    service.tramite$.subscribe(tramite => {
      // Assert
      if (tramite.empresa === null && tramite.pasoActual === 1) {
        // Estado inicial antes de la simulación
        expect(tramite.empresa).toBeNull();
        expect(tramite.producto).toBeNull();
        expect(tramite.tipoTramite).toBeNull();
        expect(tramite.documentosCargados).toEqual([]);
        expect(tramite.documentosIds).toEqual([]);
        expect(tramite.pago).toBeNull();
        expect(tramite.pasoActual).toBe(1);
        done();
      }
    });
  });

  // ==================== TESTS DE OBTENCIÓN DE ESTADO ====================

  describe('Get Current State', () => {
    it('should get current tramite state', () => {
      // Act
      const tramite = service.getTramiteActual();

      // Assert
      expect(tramite).toBeDefined();
      expect(tramite.pasoActual).toBeDefined();
    });

    it('should return tramite with paso actual', () => {
      // Act
      const tramite = service.getTramiteActual();

      // Assert
      expect(tramite.pasoActual).toBeGreaterThanOrEqual(1);
      expect(tramite.pasoActual).toBeLessThanOrEqual(5);
    });
  });

  // ==================== TESTS DE ACTUALIZACIÓN DE ESTADO ====================

  describe('Update Tramite', () => {
    it('should update empresa in tramite', (done) => {
      // Arrange
      const updates = { empresa: mockEmpresa };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.empresa?.id === 1002) {
          expect(tramite.empresa).toEqual(mockEmpresa);
          done();
        }
      });
    });

    it('should update producto in tramite', (done) => {
      // Arrange
      const updates = { producto: mockProducto };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.producto?.id === 1) {
          expect(tramite.producto).toEqual(mockProducto);
          done();
        }
      });
    });

    it('should update tipo tramite', (done) => {
      // Arrange
      const updates = { tipoTramite: TipoTramite.REGISTRO };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.tipoTramite === TipoTramite.REGISTRO) {
          expect(tramite.tipoTramite).toBe(TipoTramite.REGISTRO);
          done();
        }
      });
    });

    it('should update documentos ids', (done) => {
      // Arrange
      const updates = { documentosIds: [1, 2, 3, 4, 5] };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.documentosIds.length === 5) {
          expect(tramite.documentosIds).toEqual([1, 2, 3, 4, 5]);
          done();
        }
      });
    });

    it('should update pago', (done) => {
      // Arrange
      const updates = { pago: mockPago };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.pago?.id === 1) {
          expect(tramite.pago).toEqual(mockPago);
          done();
        }
      });
    });

    it('should update multiple fields at once', (done) => {
      // Arrange
      const updates = {
        empresa: mockEmpresa,
        producto: mockProducto,
        tipoTramite: TipoTramite.MODIFICACION
      };

      // Act
      service.actualizarTramite(updates);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.empresa?.id === 1002 && 
            tramite.producto?.id === 1 &&
            tramite.tipoTramite === TipoTramite.MODIFICACION) {
          expect(tramite.empresa).toEqual(mockEmpresa);
          expect(tramite.producto).toEqual(mockProducto);
          expect(tramite.tipoTramite).toBe(TipoTramite.MODIFICACION);
          done();
        }
      });
    });
  });

  // ==================== TESTS DE ACTUALIZACIÓN DE ESTADO ====================

  describe('Update Estado', () => {
    it('should update estado del tramite', (done) => {
      // Act
      service.actualizarEstado('EN_PROCESO');

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.estado === 'EN_PROCESO') {
          expect(tramite.estado).toBe('EN_PROCESO');
          done();
        }
      });
    });

    it('should update estado to COMPLETADO', (done) => {
      // Act
      service.actualizarEstado('COMPLETADO');

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.estado === 'COMPLETADO') {
          expect(tramite.estado).toBe('COMPLETADO');
          done();
        }
      });
    });
  });

  // ==================== TESTS DE NAVEGACIÓN DE PASOS ====================

  describe('Paso Navigation', () => {
    it('should advance to next paso', (done) => {
      // Arrange
      service.setPasoActual(2);

      // Act
      service.avanzarPaso();

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.pasoActual === 3) {
          expect(tramite.pasoActual).toBe(3);
          done();
        }
      });
    });

    it('should go back to previous paso', (done) => {
      // Arrange
      service.setPasoActual(3);

      // Act
      service.retrocederPaso();

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.pasoActual === 2) {
          expect(tramite.pasoActual).toBe(2);
          done();
        }
      });
    });

    it('should not go below paso 1', (done) => {
      // Arrange
      service.setPasoActual(1);

      // Act
      service.retrocederPaso();

      // Assert
      service.tramite$.subscribe(tramite => {
        expect(tramite.pasoActual).toBe(1);
        done();
      });
    });

    it('should set specific paso', (done) => {
      // Act
      service.setPasoActual(4);

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.pasoActual === 4) {
          expect(tramite.pasoActual).toBe(4);
          done();
        }
      });
    });
  });

  // ==================== TESTS DE VALIDACIÓN DE COMPLETITUD ====================

  describe('Completeness Validation', () => {
    it('should return false for incomplete tramite', () => {
      // Arrange
      service.limpiarTramite();

      // Act
      const esCompleto = service.esTramiteCompleto();

      // Assert
      expect(esCompleto).toBe(false);
    });

    it('should return true for complete tramite', (done) => {
      // Arrange
      service.actualizarTramite({
        empresa: mockEmpresa,
        producto: mockProducto,
        tipoTramite: TipoTramite.REGISTRO,
        documentosIds: [1, 2, 3],
        pago: mockPago
      });

      // Act & Assert
      setTimeout(() => {
        const esCompleto = service.esTramiteCompleto();
        expect(esCompleto).toBe(true);
        done();
      }, 100);
    });

    it('should return false if empresa is missing', (done) => {
      // Arrange
      service.actualizarTramite({
        empresa: null,
        producto: mockProducto,
        tipoTramite: TipoTramite.REGISTRO,
        documentosIds: [1, 2, 3],
        pago: mockPago
      });

      // Act & Assert
      setTimeout(() => {
        const esCompleto = service.esTramiteCompleto();
        expect(esCompleto).toBe(false);
        done();
      }, 100);
    });

    it('should return false if documentos are empty', (done) => {
      // Arrange
      service.actualizarTramite({
        empresa: mockEmpresa,
        producto: mockProducto,
        tipoTramite: TipoTramite.REGISTRO,
        documentosIds: [],
        pago: mockPago
      });

      // Act & Assert
      setTimeout(() => {
        const esCompleto = service.esTramiteCompleto();
        expect(esCompleto).toBe(false);
        done();
      }, 100);
    });

    it('should return false if pago is missing', (done) => {
      // Arrange
      service.actualizarTramite({
        empresa: mockEmpresa,
        producto: mockProducto,
        tipoTramite: TipoTramite.REGISTRO,
        documentosIds: [1, 2, 3],
        pago: null
      });

      // Act & Assert
      setTimeout(() => {
        const esCompleto = service.esTramiteCompleto();
        expect(esCompleto).toBe(false);
        done();
      }, 100);
    });
  });

  // ==================== TESTS DE LIMPIEZA DE ESTADO ====================

  describe('Clear State', () => {
    it('should clear all tramite data', (done) => {
      // Arrange
      service.actualizarTramite({
        empresa: mockEmpresa,
        producto: mockProducto,
        tipoTramite: TipoTramite.REGISTRO,
        documentosIds: [1, 2, 3],
        pago: mockPago,
        pasoActual: 5
      });

      // Act
      service.limpiarTramite();

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.empresa === null && tramite.pasoActual === 1) {
          expect(tramite.empresa).toBeNull();
          expect(tramite.producto).toBeNull();
          expect(tramite.tipoTramite).toBeNull();
          expect(tramite.documentosIds).toEqual([]);
          expect(tramite.pago).toBeNull();
          expect(tramite.pasoActual).toBe(1);
          done();
        }
      });
    });

    it('should reset paso actual to 1', (done) => {
      // Arrange
      service.setPasoActual(5);

      // Act
      service.limpiarTramite();

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.pasoActual === 1) {
          expect(tramite.pasoActual).toBe(1);
          done();
        }
      });
    });
  });

  // ==================== TESTS DE TIPOS DE TRÁMITE ====================

  describe('Tramite Types', () => {
    it('should handle REGISTRO tramite type', (done) => {
      // Act
      service.actualizarTramite({ tipoTramite: TipoTramite.REGISTRO });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.tipoTramite === TipoTramite.REGISTRO) {
          expect(tramite.tipoTramite).toBe(TipoTramite.REGISTRO);
          done();
        }
      });
    });

    it('should handle MODIFICACION tramite type', (done) => {
      // Act
      service.actualizarTramite({ tipoTramite: TipoTramite.MODIFICACION });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.tipoTramite === TipoTramite.MODIFICACION) {
          expect(tramite.tipoTramite).toBe(TipoTramite.MODIFICACION);
          done();
        }
      });
    });

    it('should handle RENOVACION tramite type', (done) => {
      // Act
      service.actualizarTramite({ tipoTramite: TipoTramite.RENOVACION });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.tipoTramite === TipoTramite.RENOVACION) {
          expect(tramite.tipoTramite).toBe(TipoTramite.RENOVACION);
          done();
        }
      });
    });
  });

  // ==================== TESTS DE DOCUMENTOS ====================

  describe('Documentos Management', () => {
    it('should add documentos cargados', (done) => {
      // Arrange
      const documentos = [mockDocumento];

      // Act
      service.actualizarTramite({ documentosCargados: documentos });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.documentosCargados.length > 0) {
          expect(tramite.documentosCargados).toEqual(documentos);
          done();
        }
      });
    });

    it('should update documentos ids', (done) => {
      // Arrange
      const ids = [1, 2, 3, 4, 5];

      // Act
      service.actualizarTramite({ documentosIds: ids });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.documentosIds.length === 5) {
          expect(tramite.documentosIds).toEqual(ids);
          done();
        }
      });
    });
  });

  // ==================== TESTS DE OBSERVACIONES ====================

  describe('Observaciones', () => {
    it('should add observaciones to tramite', (done) => {
      // Act
      service.actualizarTramite({ 
        observaciones: 'Trámite requiere documentos adicionales' 
      });

      // Assert
      service.tramite$.subscribe(tramite => {
        if (tramite.observaciones) {
          expect(tramite.observaciones).toBe('Trámite requiere documentos adicionales');
          done();
        }
      });
    });

    it('should update observaciones', (done) => {
      // Arrange
      service.actualizarTramite({ observaciones: 'Primera observación' });

      // Act
      setTimeout(() => {
        service.actualizarTramite({ observaciones: 'Observación actualizada' });

        service.tramite$.subscribe(tramite => {
          if (tramite.observaciones === 'Observación actualizada') {
            expect(tramite.observaciones).toBe('Observación actualizada');
            done();
          }
        });
      }, 100);
    });
  });

  // ==================== TESTS DE FLUJO COMPLETO ====================

  describe('Complete Flow', () => {
    it('should handle complete tramite workflow', (done) => {
      // Paso 1: Limpiar estado
      service.limpiarTramite();

      setTimeout(() => {
        // Paso 2: Agregar empresa y producto
        service.actualizarTramite({
          empresa: mockEmpresa,
          producto: mockProducto,
          tipoTramite: TipoTramite.REGISTRO
        });
        service.avanzarPaso();

        setTimeout(() => {
          // Paso 3: Agregar documentos
          service.actualizarTramite({
            documentosIds: [1, 2, 3, 4, 5]
          });
          service.avanzarPaso();

          setTimeout(() => {
            // Paso 4: Agregar pago
            service.actualizarTramite({
              pago: mockPago
            });
            service.avanzarPaso();

            setTimeout(() => {
              // Paso 5: Verificar completitud
              const tramite = service.getTramiteActual();
              expect(tramite.empresa).toBeDefined();
              expect(tramite.producto).toBeDefined();
              expect(tramite.tipoTramite).toBeDefined();
              expect(tramite.documentosIds.length).toBeGreaterThan(0);
              expect(tramite.pago).toBeDefined();
              expect(service.esTramiteCompleto()).toBe(true);
              done();
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    });
  });
});
