export interface DocumentoDto {
  idDocumento: number;
  nombre: string;
  version: string;
  tipo: string;
  urlNube: string;
  idTramite: number;
  aprobado: boolean;
  comentarios: string;
  // Propiedades adicionales para el frontend
  archivo?: File;
  estado?: 'pendiente' | 'completado' | 'error';
  obligatorio?: boolean;
  tamano?: string; // Cambié 'tamaño' por 'tamano' para evitar problemas con ñ
  fechaSubida?: Date;
}

export interface DocumentoRequerido {
  id: number;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  estado: 'pendiente' | 'completado' | 'error';
  archivo?: File;
  tamano?: string;
  descripcion?: string;
}
