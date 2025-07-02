export interface TipoDocumentoInvimaDTO {
  idTipoDocumento: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: 'TECNICO' | 'LEGAL' | 'EMPRESARIAL' | 'PRODUCTO';
  obligatorio: boolean;
  aplicaA: string[];
  version: string;
  fechaVigencia: Date;
  plantilla: PlantillaDocumentoDTO;
}

export interface PlantillaDocumentoDTO {
  idPlantilla: number;
  nombre: string;
  version: string;
  campos: CampoDocumentoDTO[];
  secciones: SeccionDocumentoDTO[];
  validaciones: ValidacionDocumentoDTO[];
}

export interface CampoDocumentoDTO {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'seleccion' | 'multiple' | 'archivo' | 'textarea' | 'email' | 'telefono';
  obligatorio: boolean;
  opciones?: string[];
  validacion?: string;
  dependeDe?: string;
  seccion: string;
  placeholder?: string;
  ayuda?: string;
  valor?: any;
}

export interface SeccionDocumentoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  expandible: boolean;
}

export interface ValidacionDocumentoDTO {
  campo: string;
  tipo: 'requerido' | 'minimo' | 'maximo' | 'patron' | 'personalizado';
  valor: any;
  mensaje: string;
}

export interface DocumentoGeneradoDTO {
  idDocumento: number;
  nombre: string;
  version: string;
  tipo: string;
  urlNube: string;
  idTramite: number;
  idTipoDocumento: number;
  aprobado: boolean;
  comentarios: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  datosFormulario: any;
  estadoGeneracion: 'BORRADOR' | 'GENERADO' | 'FIRMADO' | 'APROBADO';
}

export interface ProductoAlimentarioDTO {
  idProducto: number;
  nombre: string;
  marca: string;
  descripcion: string;
  categoria: CategoriaProductoDTO;
  clasificacionRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  tipoTramite: 'REGISTRO_SANITARIO' | 'NOTIFICACION_SANITARIA';
  ingredientes: IngredienteDTO[];
  aditivos: AditivoDTO[];
  presentaciones: PresentacionComercialDTO[];
  vidaUtil: number;
  condicionesAlmacenamiento: string;
  usosPrevisto: string;
  poblacionObjetivo: string;
}

export interface CategoriaProductoDTO {
  idCategoria: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  requiereAnalisis: boolean;
  documentosRequeridos: number[];
}

export interface IngredienteDTO {
  id: number;
  nombre: string;
  porcentaje: number;
  origen: string;
  funcion: string;
}

export interface AditivoDTO {
  id: number;
  nombre: string;
  codigoINS: string;
  funcion: string;
  concentracion: string;
  limitesUso: string;
}

export interface PresentacionComercialDTO {
  id: number;
  descripcion: string;
  peso: number;
  unidadMedida: string;
  tipoEmpaque: string;
  materialEmpaque: string;
}

export interface DocumentoRequestDTO {
  tipoDocumento: string;
  datosFormulario: any;
  idTramite: number;
  version: string;
}

export interface DocumentoResponseDTO {
  idDocumento: number;
  url: string;
  estado: string;
  fechaGeneracion: Date;
  errores: string[];
}
