import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiaCalendario {
  dia: number;
  fecha: Date;
  esOtroMes?: boolean;
  eventos?: EventoCalendario[];
  esHoy?: boolean;
  esFeriado?: boolean;
}

interface EventoCalendario {
  id: string;
  tipo: 'completado' | 'recordatorio' | 'vencimiento' | 'renovacion' | 'plazo_final';
  titulo: string;
  descripcion?: string;
  completado?: boolean;
  prioridad?: 'baja' | 'media' | 'alta' | 'critica';
  hora?: string;
}

@Component({
  standalone: true,
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
  imports: [CommonModule]
})
export class CalendarioComponent implements OnInit {
  calendarDays: DiaCalendario[] = [];
  mesActual: Date = new Date();
  nombreMes: string = '';
  anio: number = 0;
  diasSemana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  diasSemanaCortos: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  eventoSeleccionado: EventoCalendario | null = null;
  mostrarDetalles = false;

  ngOnInit(): void {
    this.generarCalendario();
  }

  generarCalendario(): void {
    const primerDia = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), 1);
    const ultimoDia = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 0);

    this.nombreMes = primerDia.toLocaleDateString('es-ES', { month: 'long' });
    this.anio = primerDia.getFullYear();

    this.calendarDays = [];

    // Días del mes anterior
    const diasPrevios = primerDia.getDay();
    for (let i = diasPrevios - 1; i >= 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i - 1);
      this.calendarDays.push({
        dia: fecha.getDate(),
        fecha: new Date(fecha),
        esOtroMes: true
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), dia);
      this.calendarDays.push({
        dia,
        fecha: new Date(fecha),
        eventos: this.obtenerEventosPorFecha(fecha),
        esHoy: this.esHoy(fecha),
        esFeriado: this.esFeriado(fecha)
      });
    }

    // Días del siguiente mes
    const totalCeldas = 42;
    const diasRestantes = totalCeldas - this.calendarDays.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, dia);
      this.calendarDays.push({
        dia,
        fecha: new Date(fecha),
        esOtroMes: true
      });
    }
  }

  obtenerEventosPorFecha(fecha: Date): EventoCalendario[] {
    const eventos: EventoCalendario[] = [];

    if (fecha.getDate() === 5) {
      eventos.push({
        id: '1',
        tipo: 'completado',
        titulo: 'Inspección INVIMA - Planta Principal',
        descripcion: 'Inspección sanitaria completada exitosamente. Certificación aprobada.',
        completado: true,
        prioridad: 'media',
        hora: '09:00'
      });
    }

    if (fecha.getDate() === 11) {
      eventos.push({
        id: '2',
        tipo: 'vencimiento',
        titulo: 'Vencimiento Registro Sanitario YGR-001',
        descripcion: 'El registro sanitario del Yogur ABC vence en 5 días. Renovación urgente requerida.',
        prioridad: 'critica',
        hora: '23:59'
      });
    }

    if (fecha.getDate() === 16) {
      eventos.push({
        id: '3',
        tipo: 'recordatorio',
        titulo: 'Envío de muestras al laboratorio',
        descripcion: 'Recordatorio: Enviar muestras del lote L2024-089 para análisis microbiológico',
        prioridad: 'media',
        hora: '14:30'
      });
    }

    if (fecha.getDate() === 21) {
      eventos.push({
        id: '4',
        tipo: 'renovacion',
        titulo: 'Renovación Registro Sanitario XYZ-789',
        descripcion: 'Iniciar proceso de renovación del registro sanitario. Documentación pendiente.',
        prioridad: 'alta',
        hora: '10:00'
      });
    }

    if (fecha.getDate() === 25) {
      eventos.push({
        id: '5',
        tipo: 'plazo_final',
        titulo: 'Respuesta final requerimiento INVIMA',
        descripcion: 'Último día para responder al requerimiento REQ-2024-456. Documentación técnica requerida.',
        prioridad: 'critica',
        hora: '17:00'
      });
    }

    return eventos;
  }

  mesAnterior(): void {
    this.mesActual.setMonth(this.mesActual.getMonth() - 1);
    this.generarCalendario();
  }

  mesSiguiente(): void {
    this.mesActual.setMonth(this.mesActual.getMonth() + 1);
    this.generarCalendario();
  }

  irHoy(): void {
    this.mesActual = new Date();
    this.generarCalendario();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  esFeriado(fecha: Date): boolean {
    // Implementar lógica de feriados colombianos
    return false;
  }

  obtenerClaseEvento(evento: EventoCalendario): string {
    const clasesBase = ['evento-item'];

    switch (evento.tipo) {
      case 'completado':
        clasesBase.push('evento-completado');
        break;
      case 'recordatorio':
        clasesBase.push('evento-recordatorio');
        break;
      case 'vencimiento':
      case 'renovacion':
      case 'plazo_final':
        clasesBase.push('evento-critico');
        break;
    }

    if (evento.prioridad === 'critica') {
      clasesBase.push('prioridad-critica');
    }

    return clasesBase.join(' ');
  }

  obtenerIconoEvento(tipo: string): string {
    switch (tipo) {
      case 'completado': return 'check_circle';
      case 'recordatorio': return 'schedule';
      case 'vencimiento': return 'warning';
      case 'renovacion': return 'refresh';
      case 'plazo_final': return 'priority_high';
      default: return 'event';
    }
  }

  seleccionarEvento(evento: EventoCalendario): void {
    this.eventoSeleccionado = evento;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.eventoSeleccionado = null;
  }

  obtenerResumenEventos(): { total: number; criticos: number; completados: number } {
    let total = 0;
    let criticos = 0;
    let completados = 0;

    this.calendarDays.forEach(dia => {
      if (dia.eventos) {
        total += dia.eventos.length;
        criticos += dia.eventos.filter(e => e.prioridad === 'critica').length;
        completados += dia.eventos.filter(e => e.tipo === 'completado').length;
      }
    });

    return { total, criticos, completados };
  }


}
