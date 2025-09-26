export interface EventoDTO {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  tipo: 'RECORDATORIO' | 'VENCIMIENTO' | 'RENOVACION' | 'PLAZO_FINAL' | 'COMPLETADO';
  categoria: 'REGISTRO_SANITARIO' | 'LICENCIA' | 'CERTIFICACION' | 'AUDITORIA' | 'TRAMITE';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: 'ACTIVO' | 'COMPLETADO' | 'VENCIDO' | 'CANCELADO';
  empresaId?: number;
  tramiteId?: number;
  documentoId?: number;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CrearEventoDTO {
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  tipo: 'RECORDATORIO' | 'VENCIMIENTO' | 'RENOVACION' | 'PLAZO_FINAL' | 'COMPLETADO';
  categoria: 'REGISTRO_SANITARIO' | 'LICENCIA' | 'CERTIFICACION' | 'AUDITORIA' | 'TRAMITE';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  empresaId?: number;
  tramiteId?: number;
  documentoId?: number;
}

export interface EstadisticasCalendarioDTO {
  totalEventos: number;
  eventosCriticos: number;
  eventosCompletados: number;
  eventosVencidos: number;
  eventosActivos: number;
}
