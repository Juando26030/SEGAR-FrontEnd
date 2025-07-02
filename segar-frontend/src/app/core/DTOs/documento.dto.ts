export interface DocumentoDTO {
  idDocumento: number;
  nombre: string;
  version: string;
  tipo: string;
  urlNube: string;
  idTramite: number;
  aprobado: boolean;
  comentarios?: string;
}

export interface CreateDocumentoDTO {
  nombre: string;
  version: string;
  tipo: string;
  urlNube: string;
  idTramite: number;
  aprobado: boolean;
  comentarios?: string;
}

export interface UpdateDocumentoDTO {
  nombre?: string;
  version?: string;
  tipo?: string;
  urlNube?: string;
  idTramite?: number;
  aprobado?: boolean;
  comentarios?: string;
}
