import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  tipo: 'recordatorio' | 'vencimiento' | 'renovacion' | 'plazo_final' | 'completado';
  categoria?: string;
  prioridad: 'baja' | 'media' | 'alta';
  fechaCreacion: Date;
}

interface DiaCalendario {
  dia: number;
  esOtroMes: boolean;
  esHoy: boolean;
  esFeriado: boolean;
  fecha: Date;
  eventos: Evento[];
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CalendarioComponent implements OnInit {
  fechaActual = new Date();
  mesActual = this.fechaActual.getMonth();
  anioActual = this.fechaActual.getFullYear();

  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  calendarDays: DiaCalendario[] = [];
  eventos: Evento[] = [];

  // Variables para detalles de evento
  mostrarDetalles = false;
  eventoSeleccionado: Evento | null = null;

  // Variables para nuevo evento
  mostrarModalNuevoEvento = false;
  nuevoEvento = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: '' as 'recordatorio' | 'vencimiento' | 'renovacion' | 'plazo_final' | 'completado',
    categoria: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta'
  };

  constructor() {}

  ngOnInit(): void {
    this.cargarEventosEjemplo();
    this.generarCalendario();
  }

  get nombreMes(): string {
    return this.meses[this.mesActual];
  }

  get anio(): number {
    return this.anioActual;
  }

  cargarEventosEjemplo(): void {
    const hoy = new Date();

    this.eventos = [
      {
        id: 1,
        titulo: 'Renovación Registro Sanitario',
        descripcion: 'Renovar registro sanitario del producto ABC-123',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 2).toISOString().split('T')[0],
        hora: '10:00',
        tipo: 'renovacion',
        categoria: 'registro_sanitario',
        prioridad: 'alta',
        fechaCreacion: new Date()
      },
      {
        id: 2,
        titulo: 'Vencimiento Licencia',
        descripcion: 'Vence licencia de funcionamiento',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7).toISOString().split('T')[0],
        hora: '14:30',
        tipo: 'vencimiento',
        categoria: 'licencia',
        prioridad: 'alta',
        fechaCreacion: new Date()
      },
      {
        id: 3,
        titulo: 'Reunión con INVIMA',
        descripcion: 'Reunión de seguimiento con el INVIMA',
        fecha: hoy.toISOString().split('T')[0],
        hora: '09:00',
        tipo: 'recordatorio',
        categoria: 'auditoria',
        prioridad: 'media',
        fechaCreacion: new Date()
      }
    ];
  }

  generarCalendario(): void {
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    const primerDiaSemana = primerDia.getDay();
    const diasEnMes = ultimoDia.getDate();

    this.calendarDays = [];

    // Días del mes anterior
    const mesAnterior = new Date(this.anioActual, this.mesActual, 0);
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = mesAnterior.getDate() - i;
      const fecha = new Date(this.anioActual, this.mesActual - 1, dia);

      this.calendarDays.push({
        dia,
        esOtroMes: true,
        esHoy: false,
        esFeriado: false,
        fecha,
        eventos: this.obtenerEventosPorFecha(fecha)
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(this.anioActual, this.mesActual, dia);
      const esHoy = this.esFechaHoy(fecha);

      this.calendarDays.push({
        dia,
        esOtroMes: false,
        esHoy,
        esFeriado: false,
        fecha,
        eventos: this.obtenerEventosPorFecha(fecha)
      });
    }

    // Días del mes siguiente para completar la grilla
    const celdasRestantes = 42 - this.calendarDays.length;
    for (let dia = 1; dia <= celdasRestantes; dia++) {
      const fecha = new Date(this.anioActual, this.mesActual + 1, dia);

      this.calendarDays.push({
        dia,
        esOtroMes: true,
        esHoy: false,
        esFeriado: false,
        fecha,
        eventos: this.obtenerEventosPorFecha(fecha)
      });
    }
  }

  obtenerEventosPorFecha(fecha: Date): Evento[] {
    const fechaStr = fecha.toISOString().split('T')[0];
    return this.eventos.filter(evento => evento.fecha === fechaStr);
  }

  esFechaHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear();
  }

  mesAnterior(): void {
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.generarCalendario();
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.generarCalendario();
  }

  irHoy(): void {
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();
    this.generarCalendario();
  }

  seleccionarEvento(evento: Evento): void {
    this.eventoSeleccionado = evento;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.eventoSeleccionado = null;
  }

  obtenerClaseEvento(evento: Evento): string {
    let claseBase = 'evento-item';

    switch (evento.tipo) {
      case 'completado':
        claseBase += ' evento-completado';
        break;
      case 'recordatorio':
        claseBase += ' evento-recordatorio';
        break;
      case 'vencimiento':
      case 'plazo_final':
        claseBase += ' evento-critico';
        if (evento.prioridad === 'alta') {
          claseBase += ' prioridad-critica';
        }
        break;
      default:
        claseBase += ' evento-recordatorio';
    }

    return claseBase;
  }

  obtenerIconoEvento(tipo: string): string {
    switch (tipo) {
      case 'recordatorio':
        return '🔔';
      case 'vencimiento':
        return '⏰';
      case 'renovacion':
        return '🔄';
      case 'plazo_final':
        return '⚠️';
      case 'completado':
        return '✅';
      default:
        return '📅';
    }
  }

  obtenerResumenEventos(): { total: number; criticos: number; completados: number } {
    const eventosMesActual = this.eventos.filter(evento => {
      const fechaEvento = new Date(evento.fecha);
      return fechaEvento.getMonth() === this.mesActual &&
        fechaEvento.getFullYear() === this.anioActual;
    });

    return {
      total: eventosMesActual.length,
      criticos: eventosMesActual.filter(e =>
        e.tipo === 'vencimiento' || e.tipo === 'plazo_final' || e.prioridad === 'alta'
      ).length,
      completados: eventosMesActual.filter(e => e.tipo === 'completado').length
    };
  }

  abrirModalNuevoEvento(): void {
    this.mostrarModalNuevoEvento = true;
    const hoy = new Date();
    this.nuevoEvento.fecha = hoy.toISOString().split('T')[0];
  }

  cerrarModalNuevoEvento(): void {
    this.mostrarModalNuevoEvento = false;
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevoEvento = {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      tipo: '' as any,
      categoria: '',
      prioridad: 'media'
    };
  }

  guardarNuevoEvento(): void {
    if (this.nuevoEvento.titulo && this.nuevoEvento.fecha && this.nuevoEvento.tipo) {
      const evento: Evento = {
        id: Date.now(),
        titulo: this.nuevoEvento.titulo,
        descripcion: this.nuevoEvento.descripcion,
        fecha: this.nuevoEvento.fecha,
        hora: this.nuevoEvento.hora,
        tipo: this.nuevoEvento.tipo,
        categoria: this.nuevoEvento.categoria,
        prioridad: this.nuevoEvento.prioridad,
        fechaCreacion: new Date()
      };

      this.eventos.push(evento);
      this.generarCalendario();
      this.cerrarModalNuevoEvento();

      console.log('Evento creado:', evento);
    }
  }
}
