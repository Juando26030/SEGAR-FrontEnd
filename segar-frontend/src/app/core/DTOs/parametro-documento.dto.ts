export interface ParametroDocumentoDTO {
  idParametro: number;
  tipoDocumento: string;
  nombreParametro: string;
  valorParametro: string;
  descripcion?: string;
}

export interface CreateParametroDocumentoDTO {
  tipoDocumento: string;
  nombreParametro: string;
  valorParametro: string;
  descripcion?: string;
}

export interface UpdateParametroDocumentoDTO {
  tipoDocumento?: string;
  nombreParametro?: string;
  valorParametro?: string;
  descripcion?: string;
}
