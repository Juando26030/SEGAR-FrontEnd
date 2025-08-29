// Enums principales
export enum TipoTramite {
  REGISTRO = 'REGISTRO',
  RENOVACION = 'RENOVACION',
  MODIFICACION = 'MODIFICACION'
}

export enum EstadoSolicitud {
  BORRADOR = 'BORRADOR',
  PENDIENTE = 'PENDIENTE',
  RADICADA = 'RADICADA',
  RECHAZADA = 'RECHAZADA',
  APROBADA = 'APROBADA'
}

export enum TipoDocumento {
  CERTIFICADO_CONSTITUCION = 'CERTIFICADO_CONSTITUCION',
  RUT = 'RUT',
  CONCEPTO_SANITARIO = 'CONCEPTO_SANITARIO',
  FICHA_TECNICA = 'FICHA_TECNICA',
  ETIQUETA = 'ETIQUETA',
  ANALISIS_MICROBIOLOGICO = 'ANALISIS_MICROBIOLOGICO',
  ANALISIS_FISICOQUIMICO = 'ANALISIS_FISICOQUIMICO',
  CERTIFICADO_BPM = 'CERTIFICADO_BPM',
  PLAN_HACCP = 'PLAN_HACCP'
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  EN_VERIFICACION = 'EN_VERIFICACION'
}

export enum MetodoPago {
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TRANSFERENCIA_BANCARIA = 'TRANSFERENCIA_BANCARIA',
  EFECTIVO = 'EFECTIVO',
  PSE = 'PSE'
}

// Interfaces principales
export interface RadicacionSolicitudDTO {
  empresaId: number;
  productoId: number;
  tipoTramite: TipoTramite;
  documentosId: number[];
  pagoId: number;
  observaciones?: string;
}

export interface RadicacionResponse {
  id: number;
  numeroRadicado: string;
  empresaId: number;
  nombreProducto: string;
  tipoTramite: TipoTramite;
  estado: EstadoSolicitud;
  fechaRadicacion: string;
  observaciones?: string;
  mensaje: string;
}

export interface Solicitud {
  id: number;
  empresaId: number;
  producto: Producto;
  tipoTramite: TipoTramite;
  estado: EstadoSolicitud;
  numeroRadicado: string;
  fechaRadicacion: string;
  observaciones?: string;
  documentos: Documento[];
  pago: Pago;
}

export interface Documento {
  id: number;
  nombreArchivo: string;
  tipoDocumento: TipoDocumento;
  rutaArchivo: string;
  tamanioArchivo: number;
  tipoMime: string;
  fechaCarga: string;
  obligatorio: boolean;
}

export interface Pago {
  id: number;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  referenciaPago: string;
  fechaPago: string;
  concepto: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  especificaciones: string;
  referencia: string;
  fabricante: string;
}

export interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  representanteLegal: string;
}

// Constantes para documentos obligatorios
export const DOCUMENTOS_OBLIGATORIOS = [
  TipoDocumento.CERTIFICADO_CONSTITUCION,
  TipoDocumento.RUT,
  TipoDocumento.CONCEPTO_SANITARIO,
  TipoDocumento.FICHA_TECNICA,
  TipoDocumento.ETIQUETA,
  TipoDocumento.ANALISIS_MICROBIOLOGICO,
  TipoDocumento.CERTIFICADO_BPM
];

// Labels para mostrar en la UI
export const TIPO_TRAMITE_LABELS = {
  [TipoTramite.REGISTRO]: 'Registro Sanitario',
  [TipoTramite.RENOVACION]: 'Renovación de Registro',
  [TipoTramite.MODIFICACION]: 'Modificación de Registro'
};

export const TIPO_DOCUMENTO_LABELS = {
  [TipoDocumento.CERTIFICADO_CONSTITUCION]: 'Certificado de Constitución',
  [TipoDocumento.RUT]: 'RUT',
  [TipoDocumento.CONCEPTO_SANITARIO]: 'Concepto Sanitario',
  [TipoDocumento.FICHA_TECNICA]: 'Ficha Técnica',
  [TipoDocumento.ETIQUETA]: 'Etiqueta',
  [TipoDocumento.ANALISIS_MICROBIOLOGICO]: 'Análisis Microbiológico',
  [TipoDocumento.ANALISIS_FISICOQUIMICO]: 'Análisis Fisicoquímico',
  [TipoDocumento.CERTIFICADO_BPM]: 'Certificado BPM',
  [TipoDocumento.PLAN_HACCP]: 'Plan HACCP'
};

export const ESTADO_PAGO_LABELS = {
  [EstadoPago.PENDIENTE]: 'Pendiente',
  [EstadoPago.APROBADO]: 'Aprobado',
  [EstadoPago.RECHAZADO]: 'Rechazado',
  [EstadoPago.CANCELADO]: 'Cancelado',
  [EstadoPago.EN_VERIFICACION]: 'En Verificación'
};

export const ESTADO_SOLICITUD_LABELS = {
  [EstadoSolicitud.BORRADOR]: 'Borrador',
  [EstadoSolicitud.PENDIENTE]: 'Pendiente',
  [EstadoSolicitud.RADICADA]: 'Radicada',
  [EstadoSolicitud.RECHAZADA]: 'Rechazada',
  [EstadoSolicitud.APROBADA]: 'Aprobada'
};

// Interface para manejo de errores del backend
export interface ErrorResponse {
  codigo: string;
  mensaje: string;
}
