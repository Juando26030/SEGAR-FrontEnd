export interface SuscripcionDTO {
  idSuscripcion: number;
  nombre: string;
  cantUsuarios: number;
  precio: number;
  vigencia: number;
}

export interface CreateSuscripcionDTO {
  nombre: string;
  cantUsuarios: number;
  precio: number;
  vigencia: number;
}

export interface UpdateSuscripcionDTO {
  nombre?: string;
  cantUsuarios?: number;
  precio?: number;
  vigencia?: number;
}
