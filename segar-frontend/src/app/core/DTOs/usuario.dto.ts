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

export interface Usuario {
  // ========== IDs Y VINCULACIÓN ==========
  id: number;
  keycloakId: string;
  username: string;
  email: string;

  // ========== INFORMACIÓN PERSONAL ==========
  firstName: string;
  lastName: string;
  fullName: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  gender: string;

  // ========== INFORMACIÓN DE CONTACTO ==========
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  postalCode: string;

  // ========== INFORMACIÓN LABORAL ==========
  employeeId: string;
  role: string;

  // ========== ESTADO Y AUDITORÍA ==========
  enabled: boolean;
  fechaRegistro: string;
  activo: boolean;
  roles: string[];
}
