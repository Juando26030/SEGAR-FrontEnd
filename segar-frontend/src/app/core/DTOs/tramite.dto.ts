import {DocumentoDto} from './documento.dto';

export interface TramiteDto {
  idTramite: number;
  numeroRadicado: string;
  nombreProducto: string;
  descripcionProducto: string;
  tipo: string;
  estado: string;
  fechaCreacion: Date;
  etapa: string;
  progreso: number;
  prioridad: string;
  comentarios: string;
  // Información adicional para el frontend
  documentosRequeridos?: DocumentoDto[];
  empresaInfo?: any;
  usuarioInfo?: any;
}
