/**
 * Datos de ejemplo para plantillas de documentos INVIMA
 * Este archivo contiene ejemplos de configuración para pruebas y desarrollo
 */

import { DocumentTemplateDto, DocumentCode, TramiteType } from '../DTOs/document-template.dto';

export const SAMPLE_DOCUMENT_TEMPLATES: DocumentTemplateDto[] = [
  {
    id: 1,
    code: DocumentCode.FICHA_TECNICA,
    name: 'Ficha Técnica del Producto',
    description: 'Información técnica detallada del producto alimenticio según formato ASS-RSA-FM099 del INVIMA',
    fieldsDefinition: [
      {
        key: 'nombre_comercial',
        label: 'Nombre Comercial del Producto',
        type: 'text',
        required: true,
        order: 1,
        maxLength: 200,
        placeholder: 'Ej: Yogurt Natural Premium',
        helpText: 'Nombre que aparecerá en la etiqueta del producto'
      },
      {
        key: 'nombre_tecnico',
        label: 'Nombre Técnico/INCI',
        type: 'text',
        required: true,
        order: 2,
        maxLength: 300,
        placeholder: 'Ej: Producto lácteo fermentado',
        helpText: 'Denominación técnica del producto según normativa'
      },
      {
        key: 'descripcion_producto',
        label: 'Descripción del Producto',
        type: 'textarea',
        required: true,
        order: 3,
        maxLength: 500,
        placeholder: 'Describa detalladamente el producto, su composición y características principales...',
        helpText: 'Descripción completa del producto y su uso previsto'
      },
      {
        key: 'composicion_ingredientes',
        label: 'Composición e Ingredientes',
        type: 'table',
        required: true,
        order: 4,
        columns: [
          { key: 'ingrediente', label: 'Ingrediente', type: 'text', required: true },
          { key: 'porcentaje', label: '% (p/p)', type: 'number', required: true },
          { key: 'funcion', label: 'Función Tecnológica', type: 'select', required: false, options: [
            { value: 'CONSERVANTE', label: 'Conservante' },
            { value: 'ESTABILIZANTE', label: 'Estabilizante' },
            { value: 'EMULSIFICANTE', label: 'Emulsificante' },
            { value: 'COLORANTE', label: 'Colorante' },
            { value: 'SABORIZANTE', label: 'Saborizante' },
            { value: 'INGREDIENTE_PRINCIPAL', label: 'Ingrediente Principal' }
          ]}
        ],
        helpText: 'Lista completa de ingredientes con sus porcentajes exactos'
      },
      {
        key: 'vida_util',
        label: 'Vida Útil del Producto (días)',
        type: 'number',
        required: true,
        order: 5,
        validations: [
          { type: 'min', value: 1, message: 'La vida útil debe ser al menos 1 día' },
          { type: 'max', value: 3650, message: 'La vida útil no puede exceder 10 años' }
        ],
        placeholder: 'Ej: 30',
        helpText: 'Tiempo de vida útil en condiciones normales de almacenamiento'
      },
      {
        key: 'condiciones_almacenamiento',
        label: 'Condiciones de Almacenamiento',
        type: 'multiselect',
        required: true,
        order: 6,
        options: [
          { value: 'REFRIGERACION', label: 'Refrigeración (2-8°C)' },
          { value: 'CONGELACION', label: 'Congelación (-18°C)' },
          { value: 'AMBIENTE', label: 'Temperatura ambiente (15-25°C)' },
          { value: 'LUGAR_SECO', label: 'Lugar seco' },
          { value: 'PROTEGER_LUZ', label: 'Proteger de la luz' },
          { value: 'PROTEGER_HUMEDAD', label: 'Proteger de la humedad' }
        ],
        helpText: 'Seleccione todas las condiciones de almacenamiento requeridas'
      },
      {
        key: 'presentaciones',
        label: 'Presentaciones Comerciales',
        type: 'table',
        required: true,
        order: 7,
        columns: [
          { key: 'presentacion', label: 'Presentación', type: 'text', required: true },
          { key: 'contenido_neto', label: 'Contenido Neto', type: 'text', required: true },
          { key: 'material_envase', label: 'Material del Envase', type: 'select', required: true, options: [
            { value: 'PLASTICO_PET', label: 'Plástico PET' },
            { value: 'PLASTICO_PP', label: 'Plástico PP' },
            { value: 'VIDRIO', label: 'Vidrio' },
            { value: 'CARTON', label: 'Cartón' },
            { value: 'ALUMINIO', label: 'Aluminio' },
            { value: 'TETRAPACK', label: 'Tetra Pack' }
          ]}
        ],
        helpText: 'Todas las presentaciones en que se comercializará el producto'
      },
      {
        key: 'especificaciones_fisicoquimicas',
        label: 'Especificaciones Fisicoquímicas',
        type: 'table',
        required: true,
        order: 8,
        columns: [
          { key: 'parametro', label: 'Parámetro', type: 'text', required: true },
          { key: 'unidad', label: 'Unidad', type: 'text', required: true },
          { key: 'valor_minimo', label: 'Valor Mínimo', type: 'text', required: false },
          { key: 'valor_maximo', label: 'Valor Máximo', type: 'text', required: false },
          { key: 'metodo_analisis', label: 'Método de Análisis', type: 'text', required: true }
        ],
        helpText: 'Especificaciones técnicas que debe cumplir el producto'
      }
    ],
    fileRules: {
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 10485760, // 10MB
      multipleAllowed: false
    },
    appliesToTramiteTypes: [TramiteType.REGISTRO, TramiteType.MODIFICACION],
    version: 1,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'system',
    uiHints: {
      layout: 'single-column',
      showProgress: true,
      sectionsOrder: ['informacion_general', 'composicion', 'especificaciones']
    }
  },

  {
    id: 2,
    code: DocumentCode.ETIQUETA_ROTULADO,
    name: 'Etiqueta y Rotulado',
    description: 'Arte final de etiqueta con información nutricional obligatoria según Resolución 810 de 2021',
    fieldsDefinition: [
      {
        key: 'seccion_informacion_basica',
        label: 'Información Básica de Etiqueta',
        type: 'section-header',
        required: false,
        order: 1
      },
      {
        key: 'nombre_producto_etiqueta',
        label: 'Nombre del Producto en Etiqueta',
        type: 'text',
        required: true,
        order: 2,
        maxLength: 200,
        helpText: 'Nombre exacto como aparecerá en el empaque'
      },
      {
        key: 'marca_comercial',
        label: 'Marca Comercial',
        type: 'text',
        required: true,
        order: 3,
        maxLength: 100,
        helpText: 'Marca bajo la cual se comercializa el producto'
      },
      {
        key: 'contenido_neto_declarado',
        label: 'Contenido Neto Declarado',
        type: 'text',
        required: true,
        order: 4,
        pattern: '^[0-9]+(\\.)[0-9]+ (g|kg|ml|l)$',
        placeholder: 'Ej: 250.0 ml',
        helpText: 'Peso o volumen neto del producto'
      },
      {
        key: 'seccion_informacion_nutricional',
        label: 'Información Nutricional',
        type: 'section-header',
        required: false,
        order: 5
      },
      {
        key: 'tabla_nutricional',
        label: 'Tabla de Información Nutricional',
        type: 'table',
        required: true,
        order: 6,
        columns: [
          { key: 'nutriente', label: 'Nutriente', type: 'select', required: true, options: [
            { value: 'ENERGIA', label: 'Energía' },
            { value: 'PROTEINA', label: 'Proteína' },
            { value: 'GRASA_TOTAL', label: 'Grasa total' },
            { value: 'GRASA_SATURADA', label: 'Grasa saturada' },
            { value: 'GRASA_TRANS', label: 'Grasa trans' },
            { value: 'CARBOHIDRATOS', label: 'Carbohidratos' },
            { value: 'AZUCARES_ANADIDOS', label: 'Azúcares añadidos' },
            { value: 'FIBRA', label: 'Fibra' },
            { value: 'SODIO', label: 'Sodio' },
            { value: 'CALCIO', label: 'Calcio' },
            { value: 'HIERRO', label: 'Hierro' }
          ]},
          { key: 'cantidad_100g', label: 'Por 100g/100ml', type: 'text', required: true },
          { key: 'porcion_servida', label: 'Por porción', type: 'text', required: true },
          { key: 'porcentaje_vd', label: '% VD*', type: 'number', required: false }
        ],
        helpText: 'Información nutricional según Resolución 810 de 2021 del INVIMA'
      },
      {
        key: 'tamano_porcion',
        label: 'Tamaño de Porción',
        type: 'text',
        required: true,
        order: 7,
        placeholder: 'Ej: 200 ml (1 vaso)',
        helpText: 'Tamaño de porción de referencia para valores nutricionales'
      },
      {
        key: 'porciones_por_envase',
        label: 'Porciones por Envase',
        type: 'number',
        required: true,
        order: 8,
        validations: [
          { type: 'min', value: 1, message: 'Debe contener al menos 1 porción' }
        ]
      },
      {
        key: 'seccion_advertencias',
        label: 'Advertencias y Declaraciones',
        type: 'section-header',
        required: false,
        order: 9
      },
      {
        key: 'advertencias_nutricionales',
        label: 'Advertencias Nutricionales Obligatorias',
        type: 'multiselect',
        required: false,
        order: 10,
        options: [
          { value: 'ALTO_SODIO', label: 'ALTO EN SODIO' },
          { value: 'ALTO_AZUCARES', label: 'ALTO EN AZÚCARES AÑADIDOS' },
          { value: 'ALTO_GRASAS_SATURADAS', label: 'ALTO EN GRASAS SATURADAS' },
          { value: 'ALTO_GRASAS_TRANS', label: 'ALTO EN GRASAS TRANS' }
        ],
        helpText: 'Seleccione las advertencias que aplican según los límites establecidos'
      },
      {
        key: 'contiene_alergenos',
        label: 'Contiene (Alérgenos)',
        type: 'multiselect',
        required: false,
        order: 11,
        options: [
          { value: 'GLUTEN', label: 'Gluten (trigo, avena, cebada, centeno)' },
          { value: 'LACTEOS', label: 'Leche y productos lácteos' },
          { value: 'HUEVOS', label: 'Huevos' },
          { value: 'SOJA', label: 'Soja' },
          { value: 'MANI', label: 'Maní' },
          { value: 'NUECES', label: 'Nueces de árbol' },
          { value: 'PESCADO', label: 'Pescado' },
          { value: 'MARISCOS', label: 'Mariscos' },
          { value: 'SULFITOS', label: 'Sulfitos' }
        ],
        helpText: 'Declare todos los alérgenos presentes en el producto'
      },
      {
        key: 'lista_ingredientes',
        label: 'Lista de Ingredientes',
        type: 'textarea',
        required: true,
        order: 12,
        maxLength: 1000,
        helpText: 'Lista de ingredientes en orden descendente por peso'
      },
      {
        key: 'archivo_arte_etiqueta',
        label: 'Arte Final de Etiqueta',
        type: 'file',
        required: true,
        order: 13,
        allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10485760,
        helpText: 'Archivo con el diseño final de la etiqueta en alta resolución (PDF, JPG o PNG)'
      }
    ],
    fileRules: {
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 10485760,
      multipleAllowed: true,
      maxFiles: 5
    },
    appliesToTramiteTypes: [TramiteType.REGISTRO, TramiteType.MODIFICACION],
    version: 1,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'system',
    uiHints: {
      layout: 'single-column',
      showProgress: true,
      collapsibleSections: ['seccion_advertencias']
    }
  }
];

/**
 * Datos de ejemplo para instancias de documentos
 */
export const SAMPLE_DOCUMENT_INSTANCES = [
  {
    id: 1,
    templateId: 1,
    tramiteId: 100,
    empresaId: 1,
    status: 'FILLED' as const,
    filledData: {
      nombre_comercial: 'Yogurt Natural Premium',
      nombre_tecnico: 'Producto lácteo fermentado con cultivos probióticos',
      descripcion_producto: 'Yogurt natural elaborado con leche fresca, cultivos lácteos y probióticos beneficiosos para la salud digestiva.',
      composicion_ingredientes: [
        {
          ingrediente: 'Leche entera pasteurizada',
          porcentaje: 85,
          funcion: 'INGREDIENTE_PRINCIPAL'
        },
        {
          ingrediente: 'Cultivos lácteos (S. thermophilus, L. bulgaricus)',
          porcentaje: 10,
          funcion: 'INGREDIENTE_PRINCIPAL'
        },
        {
          ingrediente: 'Probióticos (L. casei, B. bifidum)',
          porcentaje: 5,
          funcion: 'INGREDIENTE_PRINCIPAL'
        }
      ],
      vida_util: 21,
      condiciones_almacenamiento: ['REFRIGERACION', 'PROTEGER_LUZ'],
      presentaciones: [
        {
          presentacion: 'Vaso plástico',
          contenido_neto: '200 ml',
          material_envase: 'PLASTICO_PP'
        }
      ]
    },
    version: 1,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'user@empresa.com'
  }
];
