export interface NotificacionDTO {
  idNotificacion: number;
  asunto: string;
  mensaje: string;
  fecha: Date;
  idDestinatario: number;
  idTramite: number;
  leida: boolean;
}

export interface CreateNotificacionDTO {
  asunto: string;
  mensaje: string;
  idDestinatario: number;
  idTramite: number;
  leida: boolean;
}

export interface UpdateNotificacionDTO {
  asunto?: string;
  mensaje?: string;
  idDestinatario?: number;
  idTramite?: number;
  leida?: boolean;
}
