export interface ProyectoDTO {
  idProyecto: number;
  nombre: string;
  idUsuario: number;
  idTramite: number;
}

export interface CreateProyectoDTO {
  nombre: string;
  idUsuario: number;
  idTramite: number;
}

export interface UpdateProyectoDTO {
  nombre?: string;
  idUsuario?: number;
  idTramite?: number;
}
