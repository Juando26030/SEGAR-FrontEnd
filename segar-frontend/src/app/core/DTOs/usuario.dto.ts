export interface UsuarioDTO {
  idUsuario: number;
  username: string;
  nombre: string;
  cedula: string;
  correo: string;
  contrasena: string;
  idRol: number;
  idEmpresa: number;
}

export interface CreateUsuarioDTO {
  username: string;
  nombre: string;
  cedula: string;
  correo: string;
  contrasena: string;
  idRol: number;
  idEmpresa: number;
}

export interface UpdateUsuarioDTO {
  username?: string;
  nombre?: string;
  cedula?: string;
  correo?: string;
  contrasena?: string;
  idRol?: number;
  idEmpresa?: number;
}
