export interface Empresa {
  id: number;
  razonSocial: string;
  nit: string;
  nombreComercial: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  email: string;
  representanteLegal: string;
  estado: string;
  tipoEmpresa: string;
}

export interface CreateEmpresaDTO {
  razonSocial: string;
  nit: string;
  nombreComercial: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  email: string;
  representanteLegal: string;
  estado: string;
  tipoEmpresa: string;
}

export interface UpdateEmpresaDTO {
  razonSocial?: string;
  nit?: string;
  nombreComercial?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  representanteLegal?: string;
  estado?: string;
  tipoEmpresa?: string;
}
