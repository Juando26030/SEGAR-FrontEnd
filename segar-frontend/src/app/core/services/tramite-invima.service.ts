import { Injectable } from '@angular/core';

// Interfaces para el sistema de trámites INVIMA
export interface ClasificacionProducto {
  categoria: string;
  nivel_riesgo: 'bajo' | 'medio' | 'alto';
  poblacion_objetivo: string;
  procesamiento: string;
  tipo_accion?: 'registro' | 'renovacion' | 'modificacion';
  es_importado?: boolean;
}

export interface CampoDocumento {
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file';
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

  constructor() { }

  /**
   * Clasifica el producto y determina el tipo de trámite requerido
   */
  clasificarProducto(clasificacion: ClasificacionProducto): ResultadoClasificacion {
    const tramite = this.determinarTipoTramite(clasificacion);
    const documentos = this.obtenerDocumentosRequeridos(tramite, clasificacion);
    const advertencias = this.generarAdvertencias(tramite, clasificacion);

    return {
      tramite,
      tramite_descripcion: this.obtenerDescripcionTramite(tramite),
      documentos,
      advertencias,
      tiempo_estimado: this.obtenerTiempoEstimado(tramite),
      costo_estimado: this.obtenerCostoEstimado(tramite)
    };
  }

  /**
   * Determina el tipo de trámite según las reglas INVIMA COMPLETAS
   * Implementa TODAS las reglas de negocio en orden de prioridad
   */
  private determinarTipoTramite(clasificacion: ClasificacionProducto): 'NSO' | 'PSA' | 'RSA' {
    const categoria = clasificacion.categoria.toLowerCase();
    const poblacion = clasificacion.poblacion_objetivo.toLowerCase();
    const procesamiento = clasificacion.procesamiento.toLowerCase();
    const riesgo = clasificacion.nivel_riesgo.toUpperCase();

    // REGLA 1: POBLACIÓN VULNERABLE → RSA (MÁXIMA PRIORIDAD)
    // Si el producto es para población infantil, gestantes, adultos mayores
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
    // Esterilizado, atmósfera modificada, congelado
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
    // Lácteos y cárnicos con riesgo medio se elevan a RSA
    const categoriasRiesgoInherente = [
      'lácteos', 'lacteos', 'derivados lácteos', 'derivados lacteos',
      'cárnicos', 'carnicos', 'productos cárnicos', 'productos carnicos',
      'derivados cárnicos', 'derivados carnicos'
    ];

    const esCategoriaAltoRiesgo = categoriasRiesgoInherente.some(cat => categoria.includes(cat));

    if (esCategoriaAltoRiesgo && riesgo === 'MEDIO') {
      console.log('🔴 REGLA 4: Categoría de riesgo inherente alto con riesgo medio → RSA');
      return 'RSA';
    }

    // REGLA 5: PRODUCTO IMPORTADO + RIESGO MEDIO → MÍNIMO PSA
    if (clasificacion.es_importado && riesgo === 'MEDIO') {
      console.log('🟡 REGLA 5: Producto importado con riesgo medio → Mínimo PSA');
      // Continúa evaluando, podría ser RSA por otras reglas
      // pero garantiza que no sea NSO
    }

    // REGLA 6: RIESGO MEDIO → PSA
    if (riesgo === 'MEDIO') {
      console.log('🟡 REGLA 6: Riesgo medio → PSA');
      return 'PSA';
    }

    // REGLA 7: RIESGO BAJO + POBLACIÓN GENERAL → NSO
    if (riesgo === 'BAJO' && poblacion.includes('general')) {
      console.log('🟢 REGLA 7: Riesgo bajo y población general → NSO');
      return 'NSO';
    }

    // REGLA POR DEFECTO → NSO
    console.log('🟢 REGLA DEFAULT: Ninguna regla específica aplicó → NSO');
    return 'NSO';
  }

  /**
   * Obtiene los documentos requeridos según el tipo de trámite
   */
  private obtenerDocumentosRequeridos(tramite: 'NSO' | 'PSA' | 'RSA', clasificacion: ClasificacionProducto): DocumentoRequerido[] {
    const documentosBase = this.obtenerDocumentosNSO();
    let documentos = [...documentosBase];

    if (tramite === 'PSA' || tramite === 'RSA') {
      documentos = [...documentos, ...this.obtenerDocumentosPSA()];
    }

    if (tramite === 'RSA') {
      documentos = [...documentos, ...this.obtenerDocumentosRSA(clasificacion)];
    }

    // Agregar documentos adicionales para importados
    if (clasificacion.es_importado) {
      documentos = [...documentos, ...this.obtenerDocumentosImportados()];
    }

    // Agregar documentos para renovación o modificación
    if (clasificacion.tipo_accion === 'renovacion' || clasificacion.tipo_accion === 'modificacion') {
      documentos = [...documentos, ...this.obtenerDocumentosActualizacion(clasificacion.tipo_accion)];
    }

    return documentos.sort((a, b) => a.orden - b.orden);
  }

  /**
   * Documentos base para NSO (Notificación Sanitaria Obligatoria)
   */
  private obtenerDocumentosNSO(): DocumentoRequerido[] {
    return [
      {
        id: 'certificado_existencia',
        nombre: 'Certificado de Existencia y Representación Legal',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Certificado expedido por la Cámara de Comercio con vigencia no mayor a 30 días',
        categoria: 'basico',
        obligatorio: true,
        orden: 1,
        icono: 'building',
        campos: [
          { nombre: 'razon_social', tipo: 'text', requerido: true, placeholder: 'Razón social de la empresa' },
          { nombre: 'nit', tipo: 'text', requerido: true, placeholder: 'NIT sin dígito de verificación' },
          { nombre: 'representante_legal', tipo: 'text', requerido: true, placeholder: 'Nombre completo' },
          { nombre: 'fecha_expedicion', tipo: 'date', requerido: true, descripcion: 'No mayor a 30 días' },
          { nombre: 'archivo', tipo: 'file', requerido: true, descripcion: 'Formato PDF' }
        ]
      },
      {
        id: 'ficha_tecnica_basica',
        nombre: 'Ficha Técnica Básica',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Información básica del producto alimenticio',
        categoria: 'basico',
        obligatorio: true,
        orden: 2,
        icono: 'file-alt',
        campos: [
          { nombre: 'nombre_comercial', tipo: 'text', requerido: true, placeholder: 'Nombre del producto' },
          { nombre: 'marca', tipo: 'text', requerido: true, placeholder: 'Marca registrada' },
          { nombre: 'denominacion', tipo: 'text', requerido: true, placeholder: 'Denominación del alimento' },
          { nombre: 'presentacion', tipo: 'text', requerido: true, placeholder: 'Ej: Frasco x 500g' },
          { nombre: 'vida_util', tipo: 'number', requerido: true, placeholder: 'En meses' },
          { nombre: 'condiciones_conservacion', tipo: 'textarea', requerido: true, placeholder: 'Temperatura y condiciones de almacenamiento' },
          { nombre: 'ingredientes', tipo: 'textarea', requerido: true, placeholder: 'Lista completa en orden descendente' },
          { nombre: 'aditivos', tipo: 'textarea', requerido: false, placeholder: 'Conservantes, colorantes, etc.' },
          { nombre: 'alergenos', tipo: 'textarea', requerido: false, placeholder: 'Sustancias alergénicas' }
        ]
      },
      {
        id: 'etiqueta_rotulado',
        nombre: 'Etiqueta o Diseño de Rotulado',
        tipo: 'externo',
        formato: 'IMAGE',
        descripcion: 'Diseño de la etiqueta del producto conforme a la normativa colombiana',
        categoria: 'basico',
        obligatorio: true,
        orden: 3,
        icono: 'tags',
        campos: [
          { nombre: 'nombre_producto', tipo: 'text', requerido: true },
          { nombre: 'lista_ingredientes', tipo: 'textarea', requerido: true },
          { nombre: 'tabla_nutricional', tipo: 'textarea', requerido: true },
          { nombre: 'informacion_fabricante', tipo: 'text', requerido: true },
          { nombre: 'archivo_imagen', tipo: 'file', requerido: true, descripcion: 'JPG, PNG o PDF' }
        ]
      },
      {
        id: 'comprobante_pago',
        nombre: 'Comprobante de Pago INVIMA',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Recibo de pago de los derechos de trámite',
        categoria: 'basico',
        obligatorio: true,
        orden: 4,
        icono: 'receipt',
        campos: [
          { nombre: 'codigo_recaudo', tipo: 'text', requerido: true },
          { nombre: 'monto', tipo: 'number', requerido: true },
          { nombre: 'fecha_pago', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'poder_representacion',
        nombre: 'Poder de Representación',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Opcional: Si actúa mediante apoderado',
        categoria: 'otros',
        obligatorio: false,
        orden: 5,
        icono: 'user-tie',
        campos: [
          { nombre: 'otorgante', tipo: 'text', requerido: true },
          { nombre: 'apoderado', tipo: 'text', requerido: true },
          { nombre: 'objeto', tipo: 'textarea', requerido: true },
          { nombre: 'ciudad', tipo: 'text', requerido: true },
          { nombre: 'fecha', tipo: 'date', requerido: true }
        ]
      }
    ];
  }

  /**
   * Documentos adicionales para PSA (Permiso Sanitario)
   */
  private obtenerDocumentosPSA(): DocumentoRequerido[] {
    return [
      {
        id: 'analisis_fisicoquimico',
        nombre: 'Análisis Fisicoquímico',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Análisis realizado por laboratorio acreditado ante el ONAC',
        categoria: 'analisis',
        obligatorio: true,
        orden: 10,
        icono: 'flask',
        campos: [
          { nombre: 'ph', tipo: 'number', requerido: true },
          { nombre: 'humedad', tipo: 'number', requerido: true },
          { nombre: 'actividad_agua', tipo: 'number', requerido: true },
          { nombre: 'proteina', tipo: 'number', requerido: false },
          { nombre: 'grasa', tipo: 'number', requerido: false },
          { nombre: 'laboratorio', tipo: 'text', requerido: true },
          { nombre: 'fecha_ensayo', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'analisis_microbiologico',
        nombre: 'Análisis Microbiológico',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Análisis microbiológico de laboratorio acreditado',
        categoria: 'analisis',
        obligatorio: true,
        orden: 11,
        icono: 'microscope',
        campos: [
          { nombre: 'coliformes_totales', tipo: 'text', requerido: true },
          { nombre: 'e_coli', tipo: 'text', requerido: true },
          { nombre: 'salmonella', tipo: 'text', requerido: true },
          { nombre: 'mohos_levaduras', tipo: 'text', requerido: false },
          { nombre: 'laboratorio', tipo: 'text', requerido: true },
          { nombre: 'fecha_ensayo', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'certificacion_bpm',
        nombre: 'Certificación BPM del Establecimiento',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Certificado de Buenas Prácticas de Manufactura expedido por INVIMA',
        categoria: 'certificacion',
        obligatorio: true,
        orden: 12,
        icono: 'certificate',
        campos: [
          { nombre: 'nombre_establecimiento', tipo: 'text', requerido: true },
          { nombre: 'numero_registro', tipo: 'text', requerido: true },
          { nombre: 'fecha_expedicion', tipo: 'date', requerido: true },
          { nombre: 'vigencia', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'ficha_tecnica_detallada',
        nombre: 'Ficha Técnica Detallada',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Versión ampliada de la ficha técnica básica con parámetros fisicoquímicos',
        categoria: 'basico',
        obligatorio: true,
        orden: 13,
        icono: 'file-medical',
        campos: [
          { nombre: 'valores_fisicoquimicos', tipo: 'textarea', requerido: true },
          { nombre: 'parametros_microbiologicos', tipo: 'textarea', requerido: true },
          { nombre: 'vida_util_estudios', tipo: 'text', requerido: true },
          { nombre: 'conservacion_especifica', tipo: 'textarea', requerido: true }
        ]
      },
      {
        id: 'plan_bpm',
        nombre: 'Plan BPM (Buenas Prácticas de Manufactura)',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Documento con procedimientos de BPM de la planta',
        categoria: 'certificacion',
        obligatorio: true,
        orden: 14,
        icono: 'clipboard-check',
        campos: [
          { nombre: 'limpieza_desinfeccion', tipo: 'textarea', requerido: true },
          { nombre: 'control_plagas', tipo: 'textarea', requerido: true },
          { nombre: 'manejo_agua', tipo: 'textarea', requerido: true },
          { nombre: 'higiene_personal', tipo: 'textarea', requerido: true },
          { nombre: 'trazabilidad', tipo: 'textarea', requerido: true }
        ]
      }
    ];
  }

  /**
   * Documentos adicionales para RSA (Registro Sanitario de Alto Riesgo)
   */
  private obtenerDocumentosRSA(clasificacion: ClasificacionProducto): DocumentoRequerido[] {
    return [
      {
        id: 'estudios_estabilidad',
        nombre: 'Estudios de Estabilidad y Vida Útil',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Estudios que demuestran la estabilidad del producto durante su vida útil',
        categoria: 'estudios',
        obligatorio: true,
        orden: 20,
        icono: 'chart-line',
        campos: [
          { nombre: 'producto', tipo: 'text', requerido: true },
          { nombre: 'lote', tipo: 'text', requerido: true },
          { nombre: 'condiciones_almacenamiento', tipo: 'textarea', requerido: true },
          { nombre: 'temperatura', tipo: 'text', requerido: true },
          { nombre: 'tiempo_estudio', tipo: 'text', requerido: true },
          { nombre: 'vida_util_determinada', tipo: 'text', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'certificacion_haccp',
        nombre: 'Certificación HACCP',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Certificado de Análisis de Peligros y Puntos Críticos de Control',
        categoria: 'certificacion',
        obligatorio: true,
        orden: 21,
        icono: 'shield-alt',
        campos: [
          { nombre: 'empresa', tipo: 'text', requerido: true },
          { nombre: 'codigo_certificacion', tipo: 'text', requerido: true },
          { nombre: 'fecha_emision', tipo: 'date', requerido: true },
          { nombre: 'vigencia', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'plan_haccp',
        nombre: 'Plan HACCP Completo',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Plan detallado de HACCP con puntos críticos de control',
        categoria: 'certificacion',
        obligatorio: true,
        orden: 22,
        icono: 'tasks',
        campos: [
          { nombre: 'diagrama_flujo', tipo: 'textarea', requerido: true },
          { nombre: 'puntos_criticos_control', tipo: 'textarea', requerido: true },
          { nombre: 'limites_criticos', tipo: 'textarea', requerido: true },
          { nombre: 'monitoreo', tipo: 'textarea', requerido: true },
          { nombre: 'medidas_correctivas', tipo: 'textarea', requerido: true }
        ]
      },
      {
        id: 'estudios_nutricionales',
        nombre: 'Estudios Nutricionales Especializados',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Requerido para productos dirigidos a población vulnerable',
        categoria: 'estudios',
        obligatorio: this.requiereEstudiosNutricionales(clasificacion),
        orden: 23,
        icono: 'apple-alt',
        campos: [
          { nombre: 'composicion_nutricional', tipo: 'textarea', requerido: true },
          { nombre: 'macronutrientes', tipo: 'textarea', requerido: true },
          { nombre: 'micronutrientes', tipo: 'textarea', requerido: true },
          { nombre: 'alergenos', tipo: 'textarea', requerido: true },
          { nombre: 'laboratorio', tipo: 'text', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'etiquetado_especial',
        nombre: 'Advertencias y Etiquetado Especial',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Advertencias obligatorias para población vulnerable',
        categoria: 'basico',
        obligatorio: true,
        orden: 24,
        icono: 'exclamation-triangle',
        campos: [
          { nombre: 'advertencias', tipo: 'textarea', requerido: true,
            placeholder: 'Ej: "La lactancia materna es el mejor alimento para el niño"' },
          { nombre: 'instrucciones_preparacion', tipo: 'textarea', requerido: true },
          { nombre: 'contraindicaciones', tipo: 'textarea', requerido: false }
        ]
      },
      {
        id: 'protocolo_estabilidad',
        nombre: 'Protocolo de Estabilidad',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Protocolo detallado del estudio de estabilidad',
        categoria: 'estudios',
        obligatorio: true,
        orden: 25,
        icono: 'file-contract',
        campos: [
          { nombre: 'condiciones_estudio', tipo: 'textarea', requerido: true },
          { nombre: 'parametros_control', tipo: 'textarea', requerido: true },
          { nombre: 'lotes_estudio', tipo: 'text', requerido: true },
          { nombre: 'frecuencia_muestreo', tipo: 'text', requerido: true }
        ]
      }
    ];
  }

  /**
   * Documentos adicionales para productos importados
   */
  private obtenerDocumentosImportados(): DocumentoRequerido[] {
    return [
      {
        id: 'certificado_venta_libre',
        nombre: 'Certificado de Venta Libre / Registro País de Origen',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Documento que certifica la libre venta del producto en su país de origen',
        categoria: 'otros',
        obligatorio: true,
        orden: 30,
        icono: 'globe',
        campos: [
          { nombre: 'pais_origen', tipo: 'text', requerido: true },
          { nombre: 'autoridad_emisora', tipo: 'text', requerido: true },
          { nombre: 'numero_registro', tipo: 'text', requerido: true },
          { nombre: 'fecha_emision', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'autorizacion_fabricante',
        nombre: 'Autorización del Fabricante al Importador',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Carta de autorización del fabricante extranjero',
        categoria: 'otros',
        obligatorio: true,
        orden: 31,
        icono: 'file-signature',
        campos: [
          { nombre: 'fabricante', tipo: 'text', requerido: true },
          { nombre: 'importador', tipo: 'text', requerido: true },
          { nombre: 'productos_autorizados', tipo: 'textarea', requerido: true },
          { nombre: 'fecha', tipo: 'date', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      },
      {
        id: 'traduccion_oficial',
        nombre: 'Traducciones Oficiales',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: 'Traducciones oficiales de documentos en idioma extranjero',
        categoria: 'otros',
        obligatorio: true,
        orden: 32,
        icono: 'language',
        campos: [
          { nombre: 'traductor_oficial', tipo: 'text', requerido: true },
          { nombre: 'numero_tarjeta_profesional', tipo: 'text', requerido: true },
          { nombre: 'documentos_traducidos', tipo: 'textarea', requerido: true },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      }
    ];
  }

  /**
   * Documentos adicionales para renovación o modificación
   */
  private obtenerDocumentosActualizacion(tipo: 'renovacion' | 'modificacion'): DocumentoRequerido[] {
    const documentos: DocumentoRequerido[] = [
      {
        id: 'registro_anterior',
        nombre: 'Copia del Registro Sanitario Anterior',
        tipo: 'externo',
        formato: 'PDF',
        descripcion: `Copia del registro sanitario que se desea ${tipo === 'renovacion' ? 'renovar' : 'modificar'}`,
        categoria: 'basico',
        obligatorio: true,
        orden: 40,
        icono: 'file-pdf',
        campos: [
          { nombre: 'numero_registro', tipo: 'text', requerido: true },
          { nombre: 'fecha_expedicion', tipo: 'date', requerido: true },
          { nombre: 'fecha_vencimiento', tipo: 'date', requerido: tipo === 'renovacion' },
          { nombre: 'archivo', tipo: 'file', requerido: true }
        ]
      }
    ];

    if (tipo === 'modificacion') {
      documentos.push({
        id: 'justificacion_modificacion',
        nombre: 'Justificación de la Modificación',
        tipo: 'autogenerado',
        formato: 'PDF',
        descripcion: 'Documento que explica los cambios a realizar y su justificación',
        categoria: 'basico',
        obligatorio: true,
        orden: 41,
        icono: 'edit',
        campos: [
          { nombre: 'tipo_modificacion', tipo: 'select', requerido: true,
            opciones: ['Cambio de fórmula', 'Cambio de proceso', 'Cambio de empaque', 'Cambio de razón social', 'Otro'] },
          { nombre: 'descripcion_cambios', tipo: 'textarea', requerido: true },
          { nombre: 'justificacion', tipo: 'textarea', requerido: true }
        ]
      });
    }

    return documentos;
  }

  /**
   * Genera advertencias específicas según el trámite y clasificación
   */
  private generarAdvertencias(tramite: 'NSO' | 'PSA' | 'RSA', clasificacion: ClasificacionProducto): string[] {
    const advertencias: string[] = [];

    if (tramite === 'RSA') {
      advertencias.push('⚠️ Este trámite requiere estudios de estabilidad y certificación HACCP');
      advertencias.push('⏱️ El tiempo de evaluación puede extenderse de 60 a 90 días hábiles');
    }

    if (tramite === 'PSA' || tramite === 'RSA') {
      advertencias.push('🔬 Se requieren análisis de laboratorio acreditado por el ONAC');
      advertencias.push('✅ El establecimiento debe contar con certificación BPM vigente');
    }

    if (clasificacion.es_importado) {
      advertencias.push('🌍 Productos importados requieren documentación adicional del país de origen');
      advertencias.push('📄 Todos los documentos en idioma extranjero deben traducirse oficialmente');
    }

    const poblacionesVulnerables = ['infantil', 'gestantes', 'adultos mayores', 'tercera-edad'];
    if (poblacionesVulnerables.includes(clasificacion.poblacion_objetivo.toLowerCase())) {
      advertencias.push('👶 Productos para población vulnerable requieren advertencias especiales en el etiquetado');
      advertencias.push('🔬 Se requieren estudios nutricionales especializados');
    }

    return advertencias;
  }

  /**
   * Obtiene la descripción del tipo de trámite
   */
  private obtenerDescripcionTramite(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const descripciones = {
      'NSO': 'Notificación Sanitaria Obligatoria - Para productos de bajo riesgo y población general',
      'PSA': 'Permiso Sanitario - Para productos de riesgo medio que requieren control físico-químico y microbiológico',
      'RSA': 'Registro Sanitario - Para productos de alto riesgo o población vulnerable que requieren HACCP y estudios de estabilidad'
    };
    return descripciones[tramite];
  }

  /**
   * Obtiene el tiempo estimado del trámite
   */
  private obtenerTiempoEstimado(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const tiempos = {
      'NSO': '15-30 días hábiles',
      'PSA': '30-60 días hábiles',
      'RSA': '60-90 días hábiles'
    };
    return tiempos[tramite];
  }

  /**
   * Obtiene el costo estimado del trámite
   */
  private obtenerCostoEstimado(tramite: 'NSO' | 'PSA' | 'RSA'): string {
    const costos = {
      'NSO': '1-2 SMMLV',
      'PSA': '3-5 SMMLV',
      'RSA': '8-15 SMMLV'
    };
    return costos[tramite];
  }

  /**
   * Determina si se requieren estudios nutricionales
   */
  private requiereEstudiosNutricionales(clasificacion: ClasificacionProducto): boolean {
    const poblacionesEspeciales = ['infantil', 'gestantes', 'deportistas', 'tercera-edad', 'especial'];
    return poblacionesEspeciales.includes(clasificacion.poblacion_objetivo.toLowerCase());
  }

  /**
   * Valida si un documento está completo
   */
  validarDocumento(documento: DocumentoRequerido, datos: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    documento.campos.forEach(campo => {
      if (campo.requerido && !datos[campo.nombre]) {
        errores.push(`El campo "${campo.nombre}" es obligatorio`);
      }
    });

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Calcula el porcentaje de completitud de los documentos
   */
  calcularCompletitud(documentos: DocumentoRequerido[], datosCompletados: any): number {
    const obligatorios = documentos.filter(d => d.obligatorio);
    const completados = obligatorios.filter(d => datosCompletados[d.id]?.completo);
    return Math.round((completados.length / obligatorios.length) * 100);
  }
}
