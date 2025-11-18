import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DocumentTemplateService } from './document-template.service';
import { DocumentInstanceService } from './document-instance.service';

// Interfaces para el sistema de trámites INVIMA
export interface ClasificacionProducto {
  categoria: string;
  nivel_riesgo: 'bajo' | 'medio' | 'alto';
  poblacion_objetivo: string;
  procesamiento: string;
  tipo_accion?: 'registro' | 'renovacion' | 'modificacion';
  es_importado?: boolean;
}

// Mantener interfaces existentes para compatibilidad - AHORA INCLUYE CHECKBOX
export interface CampoDocumento {
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file' | 'checkbox'; // ✅ Agregado checkbox
  requerido: boolean;
  opciones?: string[];
  placeholder?: string;
  descripcion?: string;
}

export interface DocumentoRequerido {
  id: string;
  nombre: string;
  tipo: 'autogenerado' | 'externo';
  formato: 'PDF' | 'JSON' | 'IMAGE' | 'MULTI';
  descripcion: string;
  campos: CampoDocumento[];
  obligatorio: boolean;
  orden: number;
  categoria: 'basico' | 'analisis' | 'certificacion' | 'estudios' | 'otros';
  icono?: string;
}

export interface ResultadoClasificacion {
  tramite: 'NSO' | 'PSA' | 'RSA';
  tramite_descripcion: string;
  documentos: DocumentoRequerido[];
  advertencias: string[];
  tiempo_estimado: string;
  costo_estimado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TramiteInvimaService {

  constructor(
    private documentTemplateService: DocumentTemplateService,
    private documentInstanceService: DocumentInstanceService
  ) { }

  /**
   * Clasifica el producto y determina el tipo de trámite requerido
   * AHORA USA EL BACKEND PARA OBTENER DOCUMENTOS
   */
  clasificarProducto(clasificacion: ClasificacionProducto, token: string): Observable<ResultadoClasificacion> {
    const tramite = this.determinarTipoTramite(clasificacion);
    const tipoTramiteBackend = this.mapTramiteToBackend(tramite);

    // ✅ CRÍTICO: Mapear nivel de riesgo a enum del backend (I, IIA, III)
    const categoriaRiesgoBackend = this.documentTemplateService.mapRiesgoToBackendEnum(clasificacion.nivel_riesgo);

    console.log(`🔍 Clasificación: ${tramite} | Riesgo Frontend: ${clasificacion.nivel_riesgo} | Riesgo Backend: ${categoriaRiesgoBackend}`);

    // Obtener documentos desde el BACKEND
    return this.documentTemplateService
      .getTemplatesByTramiteAndRiesgo(tipoTramiteBackend, categoriaRiesgoBackend, token)
      .pipe(
        map(templates => {
          console.log(`📋 Templates recibidos del backend: ${templates.length}`);

          const documentos: DocumentoRequerido[] = templates
            .map(t => {
              const converted = this.documentTemplateService.convertToDocumentoRequerido(t);
              // Convertir explícitamente a DocumentoRequerido con campos correctos
              return {
                id: converted.id,
                nombre: converted.nombre,
                tipo: converted.tipo,
                formato: converted.formato,
                descripcion: converted.descripcion,
                campos: converted.campos as CampoDocumento[], // Cast explícito
                obligatorio: converted.obligatorio,
                orden: converted.orden,
                categoria: converted.categoria,
                icono: converted.icono
              } as DocumentoRequerido;
            })
            .sort((a, b) => a.orden - b.orden);

          const advertencias = this.generarAdvertencias(tramite, clasificacion);

          return {
            tramite,
            tramite_descripcion: this.obtenerDescripcionTramite(tramite),
            documentos,
            advertencias,
            tiempo_estimado: this.obtenerTiempoEstimado(tramite),
            costo_estimado: this.obtenerCostoEstimado(tramite)
          };
        })
      );
  }

  /**
   * Mapea el tipo de trámite frontend al formato del backend
   */
  private mapTramiteToBackend(_tramite: 'NSO' | 'PSA' | 'RSA'): string {
    // El backend usa: REGISTRO, RENOVACION, MODIFICACION
    // Pero también puede filtrar por categoría de riesgo
    return 'REGISTRO'; // Por defecto, puede ser parametrizable
  }

  /**
   * Determina el tipo de trámite según las reglas INVIMA COMPLETAS
   */
  private determinarTipoTramite(clasificacion: ClasificacionProducto): 'NSO' | 'PSA' | 'RSA' {
    const categoria = clasificacion.categoria.toLowerCase();
    const poblacion = clasificacion.poblacion_objetivo.toLowerCase();
    const procesamiento = clasificacion.procesamiento.toLowerCase();
    const riesgo = clasificacion.nivel_riesgo.toUpperCase();

    // REGLA 1: POBLACIÓN VULNERABLE → RSA
    const poblacionesVulnerables = [
      'infantil', 'bebés', 'bebes', 'niños', 'ninos',
      'gestantes', 'gestante',
      'adultos mayores', 'adulto mayor', 'tercera-edad', 'especial'
    ];

    if (poblacionesVulnerables.some(pob => poblacion.includes(pob))) {
      console.log('🔴 REGLA 1: Población vulnerable detectada → RSA');
      return 'RSA';
    }

    // REGLA 2: PROCESAMIENTO DE ALTO RIESGO → RSA
    const procesamientosAltoRiesgo = [
      'esterilizado', 'esterilización', 'esterilizacion',
      'atmósfera modificada', 'atmosfera modificada',
      'congelado', 'congelación', 'congelacion', 'ultra congelado', 'ultracongelado'
    ];

    if (procesamientosAltoRiesgo.some(proc => procesamiento.includes(proc))) {
      console.log('🔴 REGLA 2: Procesamiento de alto riesgo detectado → RSA');
      return 'RSA';
    }

    // REGLA 3: RIESGO ALTO EXPLÍCITO → RSA
    if (riesgo === 'ALTO') {
      console.log('🔴 REGLA 3: Riesgo alto explícito → RSA');
      return 'RSA';
    }

    // REGLA 4: CATEGORÍA DE RIESGO INHERENTE ALTO + RIESGO MEDIO → RSA
    const categoriasRiesgoInherente = [
      'lácteos', 'lacteos', 'derivados lácteos', 'derivados lacteos',
      'cárnicos', 'carnicos', 'productos cárnicos', 'productos carnicos'
    ];

    if (categoriasRiesgoInherente.some(cat => categoria.includes(cat)) && riesgo === 'MEDIO') {
      console.log('🔴 REGLA 4: Categoría de riesgo inherente alto con riesgo medio → RSA');
      return 'RSA';
    }

    // REGLA 6: RIESGO MEDIO → PSA
    if (riesgo === 'MEDIO') {
      console.log('🟡 REGLA 6: Riesgo medio → PSA');
      return 'PSA';
    }

    // REGLA 7: RIESGO BAJO → NSO
    console.log('🟢 REGLA 7: Riesgo bajo → NSO');
    return 'NSO';
  }

  private generarAdvertencias(tramite: 'NSO' | 'PSA' | 'RSA', clasificacion: ClasificacionProducto): string[] {
    const advertencias: string[] = [];

    if (tramite === 'RSA') {
      advertencias.push('⚠️ Registro Sanitario de Alto Riesgo requiere estudios de estabilidad y certificación HACCP.');
      advertencias.push('⚠️ El tiempo de evaluación puede ser de 60 a 90 días hábiles.');
    }

    if (tramite === 'PSA') {
      advertencias.push('⚠️ Permiso Sanitario requiere análisis microbiológicos y certificación BPM vigente.');
    }

    if (clasificacion.es_importado) {
      advertencias.push('⚠️ Producto importado requiere documentación adicional del país de origen.');
    }

    return advertencias;
  }

  private obtenerDescripcionTramite(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const descripciones = {
      'NSO': 'Notificación Sanitaria Obligatoria - Para productos de bajo riesgo',
      'PSA': 'Permiso Sanitario de Alimentos - Para productos de riesgo medio',
      'RSA': 'Registro Sanitario de Alimentos - Para productos de alto riesgo'
    };
    return descripciones[tramite];
  }

  private obtenerTiempoEstimado(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const tiempos = {
      'NSO': '15 días hábiles',
      'PSA': '30-45 días hábiles',
      'RSA': '60-90 días hábiles'
    };
    return tiempos[tramite];
  }

  private obtenerCostoEstimado(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const costos = {
      'NSO': '$500.000 - $800.000 COP',
      'PSA': '$1.200.000 - $2.000.000 COP',
      'RSA': '$2.500.000 - $4.000.000 COP'
    };
    return costos[tramite];
  }
}
