export interface DocumentoDto {
  id: number;
  bucketName: string;
  objectName: string;
  contentType: string;
  uploadedAt: Date;
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
