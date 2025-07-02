export interface EmpresaDTO {
  idEmpresa: number;
  nombre: string;
  idSuscripcion: number;
}

export interface CreateEmpresaDTO {
  nombre: string;
  idSuscripcion: number;
}

export interface UpdateEmpresaDTO {
  nombre?: string;
  idSuscripcion?: number;
}
