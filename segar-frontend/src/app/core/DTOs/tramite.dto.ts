import { EventoDTO } from './calendario.dto';
import {DocumentoDto} from './documento.dto';
import { Producto } from './solicitud.dto';
import { Usuario } from './usuario.dto';

export interface TramiteDto {
  id: number;
  radicadoNumber: string;
  submissionDate: string;
  procedureType: string;
  product: Producto;
  usuario: Usuario;
  currentStatus: string;
  lastUpdate: Date;
  eventos: EventoDTO;
  // Información adicional para el frontend
  documentos?: DocumentoDto[];
}
