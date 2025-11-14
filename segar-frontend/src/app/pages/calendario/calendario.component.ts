import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioService } from '../../core/services/calendario.service';
import { AuthService } from '../../auth/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { EventoDTO, CrearEventoDTO, EstadisticasCalendarioDTO } from '../../core/DTOs/calendario.dto';
import { Subscription, switchMap, of, catchError, finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

interface CalendarDay {
  dia: number;
  fecha: Date;
  esOtroMes: boolean;
  esHoy: boolean;
  eventos: EventoDTO[];
}

var token: string | undefined = undefined;

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit, OnDestroy {
  // ========== ESTADO DEL CALENDARIO ==========
  fechaActual: Date = new Date();
  mes: number = this.fechaActual.getMonth();
  anio: number = this.fechaActual.getFullYear();
  nombreMes: string = '';
  diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: CalendarDay[] = [];

  // ========== DATOS DEL BACKEND ==========
  eventos: EventoDTO[] = [];
  estadisticas: EstadisticasCalendarioDTO | null = null;
  usuarioId: number | null = null;
  esAdmin: boolean = false;

  // ========== ESTADOS DE UI ==========
  cargando: boolean = false;
  mostrarDetalles: boolean = false;
  mostrarModalNuevoEvento: boolean = false;
  mostrarModalEventosDia: boolean = false;
  editandoEvento: boolean = false;
  eventoSeleccionado: EventoDTO | null = null;
  eventosDiaSeleccionado: EventoDTO[] = [];

  // ========== FORMULARIO DE NUEVO EVENTO ==========
  nuevoEvento: CrearEventoDTO = this.inicializarNuevoEvento();

  // ========== SUBSCRIPCIONES ==========
  private subscriptions: Subscription = new Subscription();

  constructor(
    private calendarioService: CalendarioService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute

  ) {}

  ngOnInit(): void {
    console.log('🔄 Inicializando CalendarioComponent...');
    this.actualizarNombreMes();

    // Verificar si hay parámetros en la URL
    this.route.queryParams.subscribe(params => {
      const eventoId = params['eventoId'];
      const fechaParam = params['fecha'];

      if (eventoId && fechaParam) {
        // Navegar al mes del evento
        const fechaEvento = new Date(fechaParam);
        this.mes = fechaEvento.getMonth();
        this.anio = fechaEvento.getFullYear();
        this.actualizarNombreMes();

        // Cargar datos y luego mostrar el evento
        this.cargarDatosYMostrarEvento(parseInt(eventoId));
      } else {
        this.cargarDatos();
      }
    });
  }

  ngOnDestroy(): void {
    console.log('🛑 Destruyendo CalendarioComponent...');
    this.subscriptions.unsubscribe();
  }

  private cargarDatosYMostrarEvento(eventoId: number): void {
    this.cargando = true;

    const sub = this.authService.getUsuarioId().pipe(
      switchMap(usuarioId => {
        this.usuarioId = usuarioId;
        if (!usuarioId) {
          return of({ eventos: [], estadisticas: null, esAdmin: false });
        }

        return this.usuarioService.esAdmin(usuarioId).pipe(
          switchMap(esAdmin => {
            this.esAdmin = esAdmin;
            const eventosObs = esAdmin
              ? this.calendarioService.obtenerEventosPorMes(this.mes + 1, this.anio)
              : this.calendarioService.obtenerEventosPorMesUsuario(usuarioId, this.mes + 1, this.anio);

            const estadisticasObs = esAdmin
              ? this.calendarioService.obtenerEstadisticas()
              : this.calendarioService.obtenerEstadisticasUsuario(usuarioId);

            return eventosObs.pipe(
              switchMap(eventos =>
                estadisticasObs.pipe(
                  switchMap(estadisticas =>
                    of({ eventos, estadisticas, esAdmin })
                  )
                )
              )
            );
          }),
          catchError(() => of({ eventos: [], estadisticas: null, esAdmin: false }))
        );
      }),
      finalize(() => this.cargando = false)
    ).subscribe({
      next: ({ eventos, estadisticas, esAdmin }) => {
        this.eventos = eventos;
        this.estadisticas = estadisticas;
        this.esAdmin = esAdmin;
        this.generarCalendario();

        // Buscar y mostrar el evento específico
        const eventoEncontrado = eventos.find(e => e.id === eventoId);
        if (eventoEncontrado) {
          // Esperar un momento para que el calendario se renderice
          setTimeout(() => {
            this.seleccionarEvento(eventoEncontrado);
            this.resaltarDiaEvento(eventoEncontrado.fecha);
          }, 100);
        }
      },
      error: (error) => {
        console.error('❌ Error en la carga de datos:', error);
      }
    });

    this.subscriptions.add(sub);
  }

  private resaltarDiaEvento(fecha: string): void {
    const fechaEvento = new Date(fecha + 'T00:00:00');
    this.calendarDays.forEach(dia => {
      if (dia.fecha.getDate() === fechaEvento.getDate() &&
        dia.fecha.getMonth() === fechaEvento.getMonth() &&
        dia.fecha.getFullYear() === fechaEvento.getFullYear()) {
        // Agregar clase temporal para resaltar
        dia.esHoy = true; // Reutilizar la clase de resaltado
      }
    });
  }

  // ========== CARGA DE DATOS ==========
  private cargarDatos(): void {
    this.cargando = true;

    const sub = this.authService.getUsuarioId().pipe(
      switchMap(usuarioId => {
        this.usuarioId = usuarioId;
        console.log('👤 Usuario ID obtenido:', usuarioId);

        if (!usuarioId) {
          console.error('❌ No se pudo obtener el ID del usuario');
          return of({ eventos: [], estadisticas: null, esAdmin: false });
        }

        // Verificar si es admin
        return this.usuarioService.esAdmin(usuarioId).pipe(
          switchMap(esAdmin => {
            this.esAdmin = esAdmin;
            console.log('🔑 Usuario es admin:', esAdmin);

            // Cargar eventos según el rol
            const eventosObs = esAdmin
              ? this.calendarioService.obtenerEventosPorMes(this.mes + 1, this.anio)
              : this.calendarioService.obtenerEventosPorMesUsuario(usuarioId, this.mes + 1, this.anio);

            // Cargar estadísticas según el rol
            const estadisticasObs = esAdmin
              ? this.calendarioService.obtenerEstadisticas()
              : this.calendarioService.obtenerEstadisticasUsuario(usuarioId);

            // Combinar ambas peticiones
            return eventosObs.pipe(
              switchMap(eventos =>
                estadisticasObs.pipe(
                  switchMap(estadisticas =>
                    of({ eventos, estadisticas, esAdmin })
                  )
                )
              )
            );
          }),
          catchError(error => {
            console.error('❌ Error al verificar rol de admin:', error);
            // Si falla la verificación de admin, intentar cargar solo los eventos del usuario
            return this.calendarioService.obtenerEventosPorMesUsuario(usuarioId, this.mes + 1, this.anio).pipe(
              switchMap(eventos =>
                this.calendarioService.obtenerEstadisticasUsuario(usuarioId).pipe(
                  switchMap(estadisticas =>
                    of({ eventos, estadisticas, esAdmin: false })
                  )
                )
              ),
              catchError(() => of({ eventos: [], estadisticas: null, esAdmin: false }))
            );
          })
        );
      }),
      catchError(error => {
        console.error('❌ Error al obtener ID de usuario:', error);
        return of({ eventos: [], estadisticas: null, esAdmin: false });
      }),
      finalize(() => {
        this.cargando = false;
        console.log('✅ Carga de datos finalizada');
      })
    ).subscribe({
      next: ({ eventos, estadisticas, esAdmin }) => {
        this.eventos = eventos;
        this.estadisticas = estadisticas;
        this.esAdmin = esAdmin;
        this.generarCalendario();
        console.log('✅ Datos cargados:', {
          eventosCount: eventos.length,
          estadisticas,
          esAdmin
        });
      },
      error: (error) => {
        console.error('❌ Error en la carga de datos:', error);
      }
    });

    this.subscriptions.add(sub);
  }

  // ========== GENERACIÓN DEL CALENDARIO ==========
  private generarCalendario(): void {
    const primerDiaMes = new Date(this.anio, this.mes, 1);
    const ultimoDiaMes = new Date(this.anio, this.mes + 1, 0);
    const primerDiaSemana = primerDiaMes.getDay();
    const diasEnMes = ultimoDiaMes.getDate();

    this.calendarDays = [];

    // Días del mes anterior
    const diasMesAnterior = new Date(this.anio, this.mes, 0).getDate();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = diasMesAnterior - i;
      const fecha = new Date(this.anio, this.mes - 1, dia);
      this.calendarDays.push({
        dia,
        fecha,
        esOtroMes: true,
        esHoy: false,
        eventos: []
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(this.anio, this.mes, dia);
      const esHoy = this.esHoy(fecha);
      const eventos = this.obtenerEventosPorFecha(fecha);

      this.calendarDays.push({
        dia,
        fecha,
        esOtroMes: false,
        esHoy,
        eventos
      });
    }

    // Días del mes siguiente
    const diasRestantes = 42 - this.calendarDays.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(this.anio, this.mes + 1, dia);
      this.calendarDays.push({
        dia,
        fecha,
        esOtroMes: true,
        esHoy: false,
        eventos: []
      });
    }
  }

  private obtenerEventosPorFecha(fecha: Date): EventoDTO[] {
    return this.eventos.filter(evento => {
      // Crear fecha sin considerar la hora, solo año-mes-día
      const fechaEvento = new Date(evento.fecha + 'T00:00:00');
      const fechaLocal = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

      return (
        fechaEvento.getDate() === fechaLocal.getDate() &&
        fechaEvento.getMonth() === fechaLocal.getMonth() &&
        fechaEvento.getFullYear() === fechaLocal.getFullYear()
      );
    });
  }


  private esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }

  // ========== NAVEGACIÓN DEL CALENDARIO ==========
  mesAnterior(): void {
    if (this.mes === 0) {
      this.mes = 11;
      this.anio--;
    } else {
      this.mes--;
    }
    this.actualizarNombreMes();
    this.cargarDatos();
  }

  mesSiguiente(): void {
    if (this.mes === 11) {
      this.mes = 0;
      this.anio++;
    } else {
      this.mes++;
    }
    this.actualizarNombreMes();
    this.cargarDatos();
  }

  irHoy(): void {
    this.fechaActual = new Date();
    this.mes = this.fechaActual.getMonth();
    this.anio = this.fechaActual.getFullYear();
    this.actualizarNombreMes();
    this.cargarDatos();
  }

  private actualizarNombreMes(): void {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.nombreMes = meses[this.mes];
  }

  // ========== GESTIÓN DE EVENTOS ==========
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
    this.nuevoEvento = this.inicializarNuevoEvento();
    this.mostrarModalNuevoEvento = true;
  }

  abrirModalEditarEvento(evento: EventoDTO): void {
    this.editandoEvento = true;
    this.nuevoEvento = {
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      fecha: evento.fecha,
      hora: evento.hora || '',
      tipo: evento.tipo,
      categoria: evento.categoria,
      prioridad: evento.prioridad,
      usuarioId: evento.usuarioId,
      empresaId: evento.empresaId,
      tramiteId: evento.tramiteId
    };
    this.mostrarModalNuevoEvento = true;
    this.cerrarDetalles();
  }

  cerrarModalNuevoEvento(): void {
    this.mostrarModalNuevoEvento = false;
    this.editandoEvento = false;
    this.nuevoEvento = this.inicializarNuevoEvento();
  }

  guardarEvento(): void {
    if (!this.nuevoEvento.titulo || !this.nuevoEvento.fecha) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    this.cargando = true;
    const operacion = this.editandoEvento && this.eventoSeleccionado
      ? this.calendarioService.actualizarEvento(this.eventoSeleccionado.id, this.nuevoEvento)
      : this.calendarioService.crearEvento(this.nuevoEvento);

    const sub = operacion.pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: () => {
        console.log('✅ Evento guardado exitosamente');
        this.cerrarModalNuevoEvento();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al guardar evento:', error);
        alert('Error al guardar el evento. Intenta nuevamente.');
      }
    });

    this.subscriptions.add(sub);
  }

  eliminarEvento(evento: EventoDTO): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      return;
    }

    this.cargando = true;
    const sub = this.calendarioService.eliminarEvento(evento.id).pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: () => {
        console.log('✅ Evento eliminado exitosamente');
        this.cerrarDetalles();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al eliminar evento:', error);
        alert('Error al eliminar el evento. Intenta nuevamente.');
      }
    });

    this.subscriptions.add(sub);
  }

  marcarComoCompletado(evento: EventoDTO): void {
    this.cargando = true;
    const sub = this.calendarioService.marcarComoCompletado(evento.id).pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: () => {
        console.log('✅ Evento marcado como completado');
        this.cerrarDetalles();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al completar evento:', error);
        alert('Error al completar el evento. Intenta nuevamente.');
      }
    });

    this.subscriptions.add(sub);
  }

  mostrarTodosEventosDia(eventos: EventoDTO[]): void {
    this.eventosDiaSeleccionado = eventos;
    this.mostrarModalEventosDia = true;
  }

  cerrarModalEventosDia(): void {
    this.mostrarModalEventosDia = false;
    this.eventosDiaSeleccionado = [];
  }

  // ========== HELPERS ==========
  private inicializarNuevoEvento(): CrearEventoDTO {
    return {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      tipo: 'RECORDATORIO',
      categoria: 'TRAMITE',
      prioridad: 'MEDIA',
      usuarioId: this.usuarioId || 0,
      empresaId: undefined,
      tramiteId: undefined
    };
  }

  obtenerClaseEvento(evento: EventoDTO): string {
    const clases: string[] = [];

    if (evento.estado === 'COMPLETADO') {
      clases.push('evento-completado');
    } else if (evento.tipo === 'RECORDATORIO') {
      clases.push('evento-recordatorio');
    } else if (evento.prioridad === 'ALTA' || evento.tipo === 'PLAZO_FINAL') {
      clases.push('evento-critico');
      if (evento.prioridad === 'ALTA') {
        clases.push('prioridad-critica');
      }
    }

    return clases.join(' ');
  }

  obtenerIconoEvento(tipo: string): string {
    const iconos: Record<string, string> = {
      'RECORDATORIO': '🔔',
      'VENCIMIENTO': '⏰',
      'RENOVACION': '🔄',
      'PLAZO_FINAL': '⚠️',
      'COMPLETADO': '✅'
    };
    return iconos[tipo] || '📅';
  }
}
