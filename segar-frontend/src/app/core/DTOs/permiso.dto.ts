export interface PermisoDTO {
  idPermiso: number;
  tipo: string;
  idUsuario: number;
  idDocumento: number;
}

export interface CreatePermisoDTO {
  tipo: string;
  idUsuario: number;
  idDocumento: number;
}

export interface UpdatePermisoDTO {
  tipo?: string;
  idUsuario?: number;
  idDocumento?: number;
}
