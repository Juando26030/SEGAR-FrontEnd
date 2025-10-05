import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarioService } from '../../core/services/calendario.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { DashboardService, DashboardResumenDTO, TramitePorEstadoDTO, TramitePorMesDTO } from '../../core/services/dashboard.service';
import { interval, Subject, takeUntil, forkJoin } from 'rxjs';

interface EstadisticasTramites {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  rechazados: number;
}

interface EstadisticasFinancieras {
  ingresosMes: number;
  gastosMes: number;
  utilidadMes: number;
  crecimientoMensual: number;
}

interface EstadisticasRegistros {
  total: number;
  vigentes: number;
  porVencer: number;
  vencidos: number;
}

interface EventoReciente {
  id: number;
  titulo: string;
  fecha: string;
  tipo: string;
  prioridad: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  fechaActual: Date = new Date();
  cargando = true;

  // Estadísticas principales
  tramites: EstadisticasTramites = {
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    rechazados: 0
  };

  finanzas: EstadisticasFinancieras = {
    ingresosMes: 2450000,
    gastosMes: 1890000,
    utilidadMes: 560000,
    crecimientoMensual: 12.5
  };

  registros: EstadisticasRegistros = {
    total: 0,
    vigentes: 0,
    porVencer: 0,
    vencidos: 0
  };

  eventosRecientes: EventoReciente[] = [];

  // Datos para gráficos
  datosVentas = [65, 78, 90, 81, 56, 85, 92];
  labelesVentas = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Propiedades para trámites por mes (sin ñ)
  tramitesPorMes: TramitePorMesDTO[] = [];
  anoSeleccionado = new Date().getFullYear();
  anosDisponibles = [this.anoSeleccionado - 2, this.anoSeleccionado - 1, this.anoSeleccionado, this.anoSeleccionado + 1];

  constructor(
    private calendarioService: CalendarioService,
    private notificationService: NotificationService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargarDatosDashboard() {
    try {
      this.cargando = true;

      // Cargar datos en paralelo incluyendo trámites por mes
      const requests = forkJoin({
        resumen: this.dashboardService.getResumen(30),
        tramitesPorEstado: this.dashboardService.getTramitesPorEstado(),
        tramitesPorMes: this.dashboardService.getTramitesPorMes(this.anoSeleccionado)
      });

      requests.subscribe({
        next: (data) => {
          this.procesarDatosResumen(data.resumen);
          this.procesarDatosTramites(data.tramitesPorEstado);
          this.procesarTramitesPorMes(data.tramitesPorMes);
          this.cargarEventosRecientes();
          console.log('Datos recibidos del backend:', data);
        },
        error: (error) => {
          console.error('Error al cargar dashboard:', error);
          this.notificationService.error('Error', 'Error al cargar los datos del dashboard');
          this.cargarDatosFallback();
        },
        complete: () => {
          this.cargando = false;
        }
      });

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      this.notificationService.error('Error', 'Error al cargar los datos del dashboard');
      this.cargarDatosFallback();
      this.cargando = false;
    }
  }

  private procesarDatosResumen(resumen: DashboardResumenDTO) {
    // Procesar datos de registros sanitarios
    this.registros = {
      total: resumen.totalRegistros,
      vigentes: resumen.registrosVigentes,
      porVencer: resumen.registrosPorVencer,
      vencidos: resumen.registrosVencidos
    };
  }

  private procesarDatosTramites(tramitesPorEstado: TramitePorEstadoDTO[]) {
    // Inicializar contadores
    this.tramites = {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      completados: 0,
      rechazados: 0
    };

    // Procesar cada estado
    tramitesPorEstado.forEach(item => {
      this.tramites.total += item.cantidad;

      switch (item.estado.toUpperCase()) {
        case 'RADICADO':
        case 'PENDIENTE':
          this.tramites.pendientes += item.cantidad;
          break;
        case 'EN_EVALUACION_TECNICA':
        case 'REQUIERE_INFORMACION':
        case 'EN_PROCESO':
          this.tramites.enProceso += item.cantidad;
          break;
        case 'APROBADO':
        case 'COMPLETADO':
          this.tramites.completados += item.cantidad;
          break;
        case 'RECHAZADO':
        case 'NEGADO':
          this.tramites.rechazados += item.cantidad;
          break;
        default:
          this.tramites.enProceso += item.cantidad;
      }
    });
  }

  private procesarTramitesPorMes(tramitesPorMes: TramitePorMesDTO[]) {
    // Inicializar array con 12 meses
    this.tramitesPorMes = [];
    this.tramitesPorMes.push({ mes: 1, cantidad: 10 });
    for (let mes = 2; mes <= 12; mes++) {
      const mesData = tramitesPorMes.find(t => t.mes === mes);
      this.tramitesPorMes.push({
        mes: mes,
        cantidad: mesData ? mesData.cantidad : 0
      });
    }
  }

  private cargarDatosFallback() {
    // Datos de respaldo en caso de error en la API
    this.tramites = {
      total: 156,
      pendientes: 23,
      enProceso: 45,
      completados: 78,
      rechazados: 10
    };

    this.registros = {
      total: 89,
      vigentes: 72,
      porVencer: 12,
      vencidos: 5
    };

    // Datos fallback para trámites por mes
    this.tramitesPorMes = [
      { mes: 1, cantidad: 12 }, { mes: 2, cantidad: 18 }, { mes: 3, cantidad: 25 },
      { mes: 4, cantidad: 15 }, { mes: 5, cantidad: 22 }, { mes: 6, cantidad: 28 },
      { mes: 7, cantidad: 19 }, { mes: 8, cantidad: 24 }, { mes: 9, cantidad: 16 },
      { mes: 10, cantidad: 20 }, { mes: 11, cantidad: 14 }, { mes: 12, cantidad: 11 }
    ];
  }

  private cargarEventosRecientes() {
    // Mantener eventos estáticos por ahora
    this.eventosRecientes = [
      { id: 1, titulo: 'Renovación Registro Sanitario', fecha: '2024-01-15', tipo: 'RENOVACION', prioridad: 'ALTA' },
      { id: 2, titulo: 'Auditoría Calidad', fecha: '2024-01-18', tipo: 'AUDITORIA', prioridad: 'MEDIA' },
      { id: 3, titulo: 'Vencimiento Licencia', fecha: '2024-01-20', tipo: 'VENCIMIENTO', prioridad: 'ALTA' }
    ];
  }

  iniciarActualizacionAutomatica(): void {
    // Actualizar fecha cada minuto
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fechaActual = new Date();
      });

    // Recargar datos cada 5 minutos
    interval(300000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarDatosDashboard();
      });
  }

  obtenerNombreMes(numeroMes: number): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return meses[numeroMes - 1] || `M${numeroMes}`;
  }





  obtenerPorcentajeTramites(valor: number): number {
    return this.tramites.total > 0 ? (valor / this.tramites.total) * 100 : 0;
  }

  obtenerPorcentajeRegistros(valor: number): number {
    return this.registros.total > 0 ? (valor / this.registros.total) * 100 : 0;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  obtenerGradienteDonut(): string {
    const total = this.tramites.total;
    if (total === 0) return 'conic-gradient(#e9ecef 0% 100%)';

    const completados = (this.tramites.completados / total) * 100;
    const proceso = (this.tramites.enProceso / total) * 100;
    const pendientes = (this.tramites.pendientes / total) * 100;
    const rechazados = (this.tramites.rechazados / total) * 100;

    let acumulado = 0;
    const segmentos = [];

    if (completados > 0) {
      segmentos.push(`#11998e ${acumulado}% ${acumulado + completados}%`);
      acumulado += completados;
    }

    if (proceso > 0) {
      segmentos.push(`#667eea ${acumulado}% ${acumulado + proceso}%`);
      acumulado += proceso;
    }

    if (pendientes > 0) {
      segmentos.push(`#f093fb ${acumulado}% ${acumulado + pendientes}%`);
      acumulado += pendientes;
    }

    if (rechazados > 0) {
      segmentos.push(`#dc3545 ${acumulado}% ${acumulado + rechazados}%`);
      acumulado += rechazados;
    }

    return `conic-gradient(${segmentos.join(', ')})`;
  }

  verCalendario() {
    this.router.navigate(['/main/calendario']);
  }

  nuevoTramite(): void {
    this.router.navigate(['/main/nuevo']);
  }

  gestionarDocumentos(): void {
    this.router.navigate(['/main/documentos']);
  }

  verNotificaciones(): void {
    this.router.navigate(['/main/notificaciones']);
  }

  configurarSistema(): void {
    this.router.navigate(['/main/configuracion']);
  }


  obtenerPorcentajeEscala(valor: number): number {
    const max = this.obtenerMaximoTramites();
    return (valor / max) * 100;
  }

// Agregar estos métodos al componente

  trackByIndex(index: number): number {
    return index;
  }

  trackByMes(index: number, item: TramitePorMesDTO): number {
    return item.mes;
  }

  obtenerTooltipBarra(tramite: TramitePorMesDTO): string {
    return `${this.obtenerNombreMes(tramite.mes)} ${this.anoSeleccionado}: ${tramite.cantidad} trámite${tramite.cantidad !== 1 ? 's' : ''}`;
  }

  obtenerTotalTramitesAno(): number {
    return this.tramitesPorMes.reduce((total, tramite) => total + tramite.cantidad, 0);
  }

  obtenerPromedioMensual(): number {
    const total = this.obtenerTotalTramitesAno();
    return total / 12;
  }

  obtenerMesConMasTramites(): string {
    if (this.tramitesPorMes.length === 0) return 'N/A';

    const mesMaximo = this.tramitesPorMes.reduce((max, current) =>
      current.cantidad > max.cantidad ? current : max
    );

    return `${this.obtenerNombreMes(mesMaximo.mes)} (${mesMaximo.cantidad})`;
  }

  obtenerEscalaGrafico(): number[] {
    const max = this.obtenerMaximoTramites();

    if (max === 0) {
      return [0, 0, 0, 0, 0];
    }

    // Determinar el valor máximo de la escala basado en el máximo real
    let escalaMaxima: number;

    if (max <= 5) {
      escalaMaxima = 5;
    } else if (max <= 10) {
      escalaMaxima = 10;
    } else if (max <= 25) {
      escalaMaxima = 25;
    } else if (max <= 50) {
      escalaMaxima = 50;
    } else if (max <= 100) {
      escalaMaxima = Math.ceil(max / 10) * 10; // Redondear a la decena superior
    } else if (max <= 500) {
      escalaMaxima = Math.ceil(max / 50) * 50; // Redondear al múltiplo de 50 superior
    } else if (max <= 1000) {
      escalaMaxima = Math.ceil(max / 100) * 100; // Redondear al múltiplo de 100 superior
    } else {
      escalaMaxima = Math.ceil(max / 500) * 500; // Para valores muy grandes
    }

    // Crear 5 puntos en la escala
    const paso = escalaMaxima / 4;

    return [
      escalaMaxima,
      Math.round(escalaMaxima - paso),
      Math.round(escalaMaxima - (paso * 2)),
      Math.round(escalaMaxima - (paso * 3)),
      0
    ];
  }

  obtenerAlturaBarraPorcentaje(valor: number): number {
    if (valor === 0) return 0;

    const escala = this.obtenerEscalaGrafico();
    const maximo = escala[0]; // El primer valor es el máximo de la escala

    if (maximo === 0) return 0;

    // Calcular el porcentaje basado en la escala máxima
    const porcentaje = (valor / maximo) * 100;

    console.log('Porcentaje:', porcentaje);
    // Asegurar una altura mínima visible para valores > 0
    return Math.max(porcentaje, 2);
  }

  obtenerMaximoTramites(): number {
    if (!this.tramitesPorMes || this.tramitesPorMes.length === 0) {
      return 0;
    }

    return Math.max(...this.tramitesPorMes.map(t => t.cantidad));
  }


// Mejorar el método cambiarAno para mejor UX
  cambiarAno(ano: number) {
    if (ano !== this.anoSeleccionado && !this.cargando) {
      this.anoSeleccionado = ano;
      this.cargando = true;
      this.cargarTramitesPorMes();
    }
  }

// Mejorar el método cargarTramitesPorMes
  private cargarTramitesPorMes() {
    this.dashboardService.getTramitesPorMes(this.anoSeleccionado)
      .subscribe({
        next: (data) => {
          this.procesarTramitesPorMes(data);
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar trámites por mes:', error);
          this.notificationService.error('Error', `Error al cargar trámites del año ${this.anoSeleccionado}`);
          this.cargando = false;
        }
      });
  }


}
