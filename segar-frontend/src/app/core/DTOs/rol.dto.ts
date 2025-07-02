export interface RolDTO {
  idRol: number;
  nombre: string;
}

export interface CreateRolDTO {
  nombre: string;
}

export interface UpdateRolDTO {
  nombre?: string;
}
