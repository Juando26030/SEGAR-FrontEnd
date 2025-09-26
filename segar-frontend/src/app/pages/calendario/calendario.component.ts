import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioService } from '../../core/services/calendario.service';
import { EventoDTO, CrearEventoDTO, EstadisticasCalendarioDTO } from '../../core/DTOs/calendario.dto';

interface DiaCalendario {
  dia: number;
  esOtroMes: boolean;
  esHoy: boolean;
  esFeriado: boolean;
  fecha: Date;
  eventos: EventoDTO[];
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
  eventos: EventoDTO[] = [];
  estadisticas: EstadisticasCalendarioDTO | null = null;
  tiposEvento: string[] = [];
  categoriasEvento: string[] = [];

  // Variables para detalles de evento
  mostrarDetalles = false;
  eventoSeleccionado: EventoDTO | null = null;

  // Variables para nuevo evento
  mostrarModalNuevoEvento = false;
  editandoEvento = false;
  eventoEditandoId: number | null = null;

  nuevoEvento: CrearEventoDTO = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'RECORDATORIO',
    categoria: 'TRAMITE',
    prioridad: 'MEDIA'
  };

  cargando = false;

  constructor(private calendarioService: CalendarioService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.cargando = true;

    // Cargar eventos del mes actual
    this.cargarEventosPorMes();

    // Cargar estadísticas
    this.cargarEstadisticas();

    // Cargar tipos y categorías
    this.cargarTiposYCategorias();
  }

  cargarEventosPorMes(): void {
    this.calendarioService.obtenerEventosPorMes(this.mesActual + 1, this.anioActual)
      .subscribe({
        next: (eventos) => {
          this.eventos = eventos;
          this.generarCalendario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar eventos:', error);
          this.cargando = false;
        }
      });
  }

  cargarEstadisticas(): void {
    this.calendarioService.obtenerEstadisticas()
      .subscribe({
        next: (estadisticas) => {
          this.estadisticas = estadisticas;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  cargarTiposYCategorias(): void {
    this.calendarioService.obtenerTiposEvento()
      .subscribe({
        next: (tipos) => {
          this.tiposEvento = tipos;
        },
        error: (error) => {
          console.error('Error al cargar tipos de evento:', error);
        }
      });

    this.calendarioService.obtenerCategoriasEvento()
      .subscribe({
        next: (categorias) => {
          this.categoriasEvento = categorias;
        },
        error: (error) => {
          console.error('Error al cargar categorías de evento:', error);
        }
      });
  }

  get nombreMes(): string {
    return this.meses[this.mesActual];
  }

  get anio(): number {
    return this.anioActual;
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

  obtenerEventosPorFecha(fecha: Date): EventoDTO[] {
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
    this.cargarEventosPorMes();
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.cargarEventosPorMes();
  }

  irHoy(): void {
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();
    this.cargarEventosPorMes();
  }

  seleccionarEvento(evento: EventoDTO): void {
    this.eventoSeleccionado = evento;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.eventoSeleccionado = null;
  }

  abrirModalNuevoEvento(): void {
    this.editandoEvento = false;
    this.eventoEditandoId = null;
    this.mostrarModalNuevoEvento = true;
    const hoy = new Date();
    this.nuevoEvento.fecha = hoy.toISOString().split('T')[0];
  }

  abrirModalEditarEvento(evento: EventoDTO): void {
    this.editandoEvento = true;
    this.eventoEditandoId = evento.id;
    this.mostrarModalNuevoEvento = true;

    this.nuevoEvento = {
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      fecha: evento.fecha,
      hora: evento.hora || '',
      tipo: evento.tipo,
      categoria: evento.categoria,
      prioridad: evento.prioridad,
      empresaId: evento.empresaId,
      tramiteId: evento.tramiteId,
      documentoId: evento.documentoId
    };
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
      tipo: 'RECORDATORIO',
      categoria: 'TRAMITE',
      prioridad: 'MEDIA'
    };
    this.editandoEvento = false;
    this.eventoEditandoId = null;
  }

  guardarEvento(): void {
    if (!this.nuevoEvento.titulo || !this.nuevoEvento.fecha || !this.nuevoEvento.tipo) {
      return;
    }

    this.cargando = true;

    if (this.editandoEvento && this.eventoEditandoId) {
      // Actualizar evento existente
      this.calendarioService.actualizarEvento(this.eventoEditandoId, this.nuevoEvento)
        .subscribe({
          next: () => {
            this.cargarEventosPorMes();
            this.cargarEstadisticas();
            this.cerrarModalNuevoEvento();
          },
          error: (error) => {
            console.error('Error al actualizar evento:', error);
            this.cargando = false;
          }
        });
    } else {
      // Crear nuevo evento
      this.calendarioService.crearEvento(this.nuevoEvento)
        .subscribe({
          next: () => {
            this.cargarEventosPorMes();
            this.cargarEstadisticas();
            this.cerrarModalNuevoEvento();
          },
          error: (error) => {
            console.error('Error al crear evento:', error);
            this.cargando = false;
          }
        });
    }
  }

  eliminarEvento(evento: EventoDTO): void {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.calendarioService.eliminarEvento(evento.id)
        .subscribe({
          next: () => {
            this.cargarEventosPorMes();
            this.cargarEstadisticas();
            this.cerrarDetalles();
          },
          error: (error) => {
            console.error('Error al eliminar evento:', error);
          }
        });
    }
  }

  marcarComoCompletado(evento: EventoDTO): void {
    this.calendarioService.marcarComoCompletado(evento.id)
      .subscribe({
        next: () => {
          this.cargarEventosPorMes();
          this.cargarEstadisticas();
          this.cerrarDetalles();
        },
        error: (error) => {
          console.error('Error al marcar evento como completado:', error);
        }
      });
  }

  obtenerClaseEvento(evento: EventoDTO): string {
    let claseBase = 'evento-item';

    switch (evento.tipo) {
      case 'COMPLETADO':
        claseBase += ' evento-completado';
        break;
      case 'RECORDATORIO':
        claseBase += ' evento-recordatorio';
        break;
      case 'VENCIMIENTO':
      case 'PLAZO_FINAL':
        claseBase += ' evento-critico';
        if (evento.prioridad === 'ALTA') {
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
      case 'RECORDATORIO':
        return '🔔';
      case 'VENCIMIENTO':
        return '⏰';
      case 'RENOVACION':
        return '🔄';
      case 'PLAZO_FINAL':
        return '⚠️';
      case 'COMPLETADO':
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
        e.tipo === 'VENCIMIENTO' || e.tipo === 'PLAZO_FINAL' || e.prioridad === 'ALTA'
      ).length,
      completados: eventosMesActual.filter(e => e.tipo === 'COMPLETADO').length
    };
  }

  mostrarTodosEventosDia(eventos: EventoDTO[]): void {
    // Por ahora muestra el primer evento, puedes implementar un modal con todos
    if (eventos.length > 0) {
      this.seleccionarEvento(eventos[0]);
    }
  }

}
