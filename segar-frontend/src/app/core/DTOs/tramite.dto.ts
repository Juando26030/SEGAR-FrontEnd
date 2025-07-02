export interface TramiteDTO {
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
  comentarios?: string;
}

export interface CreateTramiteDTO {
  numeroRadicado: string;
  nombreProducto: string;
  descripcionProducto: string;
  tipo: string;
  estado: string;
  etapa: string;
  progreso: number;
  prioridad: string;
  comentarios?: string;
}

export interface UpdateTramiteDTO {
  numeroRadicado?: string;
  nombreProducto?: string;
  descripcionProducto?: string;
  tipo?: string;
  estado?: string;
  etapa?: string;
  progreso?: number;
  prioridad?: string;
  comentarios?: string;
}
