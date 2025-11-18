import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarioService } from '../../core/services/calendario.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { DashboardService, DashboardResumenDTO, TramitePorEstadoDTO, TramitePorMesDTO } from '../../core/services/dashboard.service';
import { interval, Subject, takeUntil, forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import {FormsModule} from '@angular/forms';
import { EventoDTO} from '../../core/DTOs/calendario.dto';
import { AuthService } from '../../auth/services/auth.service'; // Agregar esta importación

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

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
  descripcion?: string;
  fecha: string;
  tipoEvento: string;
  categoriaEvento: string;
  prioridadEvento: string;
  estadoEvento: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartPersonalizado', { static: false }) chartPersonalizadoRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private destroy$ = new Subject<void>();
  private chartPersonalizado: Chart | null = null;
  mostrarConfigPanel = false;
  cargandoGraficoPersonalizado = false;

  graficoConfig = {
    tipoDatos: 'tramites',
    tipoGrafico: 'doughnut',
    visualizarPor: 'estado'
  };

  datosGraficoPersonalizado: any[] = [];

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

  // Propiedades para trámites por mes
  tramitesPorMes: TramitePorMesDTO[] = [];
  anoSeleccionado = new Date().getFullYear();

  private usuarioId: number | null = null; // Agregar esta propiedad

  token = '';

  constructor(
    private calendarioService: CalendarioService,
    private notificationService: NotificationService,
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService // Agregar esta inyección
  ) {}

  ngOnInit() {
    this.token = this.authService.getToken()!;
    // Obtener el usuarioId antes de cargar datos
    this.authService.getUsuarioId().subscribe(id => {
      this.usuarioId = id;
      this.cargarDatosDashboard();
    });
    this.iniciarActualizacionAutomatica();
    this.generarRangoAnos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.crearGraficoBarras();
      this.crearGraficoPersonalizado();
    }, 100);
  }

  toggleConfigPanel() {
    this.mostrarConfigPanel = !this.mostrarConfigPanel;
  }

  aplicarPreset(preset: string) {
    switch (preset) {
      case 'tramites-estado':
        this.graficoConfig = { tipoDatos: 'tramites', tipoGrafico: 'doughnut', visualizarPor: 'estado' };
        break;
      case 'tramites-mes':
        this.graficoConfig = { tipoDatos: 'tramites', tipoGrafico: 'bar', visualizarPor: 'mes' };
        break;
      case 'registros-estado':
        this.graficoConfig = { tipoDatos: 'registros', tipoGrafico: 'pie', visualizarPor: 'estado' };
        break;
    }
    this.actualizarGraficoPersonalizado();
  }

  private crearGraficoPersonalizado() {
    if (this.chartPersonalizadoRef?.nativeElement) {
      const ctx = this.chartPersonalizadoRef.nativeElement.getContext('2d');
      if (ctx) {
        this.chartPersonalizado = new Chart(ctx, {
          type: this.graficoConfig.tipoGrafico as any,
          data: this.obtenerDatosGraficoPersonalizado(),
          options: this.obtenerOpcionesGraficoPersonalizado()
        });
      }
    }
  }

  actualizarGraficoPersonalizado() {
    this.cargandoGraficoPersonalizado = true;

    setTimeout(() => {
      if (this.chartPersonalizado) {
        this.chartPersonalizado.destroy();
      }
      this.crearGraficoPersonalizado();
      this.cargandoGraficoPersonalizado = false;
    }, 300);
  }

  private obtenerDatosGraficoPersonalizado(): any {
    const { tipoDatos, tipoGrafico, visualizarPor } = this.graficoConfig;

    if (tipoDatos === 'tramites') {
      if (visualizarPor === 'estado') {
        return {
          labels: ['Completados', 'En Proceso', 'Pendientes', 'Rechazados'],
          datasets: [{
            label: 'Trámites por Estado',
            data: [
              this.tramites.completados,
              this.tramites.enProceso,
              this.tramites.pendientes,
              this.tramites.rechazados
            ],
            backgroundColor: [
              'rgba(17, 153, 142, 0.8)',
              'rgba(102, 126, 234, 0.8)',
              'rgba(240, 147, 251, 0.8)',
              'rgba(220, 53, 69, 0.8)'
            ],
            borderColor: [
              'rgba(17, 153, 142, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(240, 147, 251, 1)',
              'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 2
          }]
        };
      } else if (visualizarPor === 'mes') {
        return {
          labels: this.tramitesPorMes.map(t => this.obtenerNombreMes(t.mes)),
          datasets: [{
            label: 'Trámites por Mes',
            data: this.tramitesPorMes.map(t => t.cantidad),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            borderRadius: tipoGrafico === 'bar' ? 8 : 0
          }]
        };
      }
    } else if (tipoDatos === 'registros') {
      return {
        labels: ['Vigentes', 'Por Vencer', 'Vencidos'],
        datasets: [{
          label: 'Registros Sanitarios',
          data: [
            this.registros.vigentes,
            this.registros.porVencer,
            this.registros.vencidos
          ],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 2
        }]
      };
    }

    return { labels: [], datasets: [] };
  }

  private obtenerOpcionesGraficoPersonalizado(): any {
    const { tipoGrafico } = this.graficoConfig;

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: tipoGrafico === 'pie' || tipoGrafico === 'doughnut',
          position: 'bottom' as const,
          labels: {
            padding: 15,
            font: { size: 12, weight: '600' },
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 }
        }
      }
    };

    if (tipoGrafico === 'bar' || tipoGrafico === 'line') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'bold' } }
          }
        }
      };
    }

    return baseOptions;
  }

  obtenerTotalGraficoPersonalizado(): number {
    const { tipoDatos } = this.graficoConfig;
    return tipoDatos === 'tramites' ? this.tramites.total : this.registros.total;
  }

  obtenerMaximoGraficoPersonalizado(): string {
    const datos = this.chartPersonalizado?.data.datasets[0].data as number[] || [];
    const max = Math.max(...datos);
    const index = datos.indexOf(max);
    const label = this.chartPersonalizado?.data.labels?.[index] || '';
    return `${label} (${max})`;
  }

  obtenerPromedioGraficoPersonalizado(): string {
    const datos = this.chartPersonalizado?.data.datasets[0].data as number[] || [];
    const promedio = datos.reduce((a, b) => a + b, 0) / datos.length;
    return promedio.toFixed(1);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearGraficoBarras() {
    if (this.chartCanvas?.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');

      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.tramitesPorMes.map(t => this.obtenerNombreMes(t.mes)),
            datasets: [{
              label: 'Trámites',
              data: this.tramitesPorMes.map(t => t.cantidad),
              backgroundColor: 'rgba(102, 126, 234, 0.8)',
              borderColor: 'rgba(102, 126, 234, 1)',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: 'easeOutCubic'
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  title: (context) => {
                    return `${context[0].label} ${this.anoSeleccionado}`;
                  },
                  label: (context) => {
                    const valor = context.parsed.y;
                    return `${valor} trámite${valor !== 1 ? 's' : ''}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                border: {
                  display: false
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  color: '#6c757d',
                  font: {
                    size: 12
                  },
                  stepSize: 1
                }
              },
              x: {
                border: {
                  display: false
                },
                grid: {
                  display: false
                },
                ticks: {
                  color: '#6c757d',
                  font: {
                    size: 12,
                    weight: "bold"
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });
      }
    }
  }


  private actualizarGrafico() {
    if (this.chart) {
      this.chart.data.labels = this.tramitesPorMes.map(t => this.obtenerNombreMes(t.mes));
      this.chart.data.datasets[0].data = this.tramitesPorMes.map(t => t.cantidad);
      this.chart.update('active');
    }
  }

  async cargarDatosDashboard() {
    try {
      this.cargando = true;

      const requests = forkJoin({
        resumen: this.dashboardService.getResumen(this.token, undefined, undefined, this.usuarioId ?? undefined), // Pasar usuarioId
        tramitesPorEstado: this.dashboardService.getTramitesPorEstado(this.token, undefined, this.usuarioId ?? undefined), // Pasar usuarioId
        tramitesPorMes: this.dashboardService.getTramitesPorMes(this.token, this.anoSeleccionado, undefined, this.usuarioId ?? undefined), // Pasar usuarioId
        eventosProximos: this.calendarioService.obtenerEventosProximos(this.token)
      });

      requests.subscribe({
        next: (data) => {
          this.procesarDatosResumen(data.resumen);
          this.procesarDatosTramites(data.tramitesPorEstado);
          this.procesarTramitesPorMes(data.tramitesPorMes);
          this.eventosRecientes = this.procesarEventosProximos(data.eventosProximos);
          this.actualizarGrafico();
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
// Método para procesar eventos próximos del calendario
  private procesarEventosProximos(eventos: EventoDTO[]): EventoReciente[] {
    return eventos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha: evento.fecha,
      tipoEvento: evento.tipo,
      categoriaEvento: evento.categoria,
      prioridadEvento: evento.prioridad,
      estadoEvento: evento.estado,
    }));
  }

  private procesarDatosResumen(resumen: DashboardResumenDTO) {
    this.registros = {
      total: resumen.totalRegistros,
      vigentes: resumen.registrosVigentes,
      porVencer: resumen.registrosPorVencer,
      vencidos: resumen.registrosVencidos
    };
  }

  private procesarDatosTramites(tramitesPorEstado: TramitePorEstadoDTO[]) {
    this.tramites = {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      completados: 0,
      rechazados: 0
    };

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
    this.tramitesPorMes = [];
    for (let mes = 1; mes <= 12; mes++) {
      const mesData = tramitesPorMes.find(t => t.mes === mes);
      this.tramitesPorMes.push({
        mes: mes,
        cantidad: mesData ? mesData.cantidad : 0
      });
    }
  }

  private cargarDatosFallback() {
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

    this.tramitesPorMes = [
      { mes: 1, cantidad: 12 }, { mes: 2, cantidad: 18 }, { mes: 3, cantidad: 25 },
      { mes: 4, cantidad: 15 }, { mes: 5, cantidad: 22 }, { mes: 6, cantidad: 28 },
      { mes: 7, cantidad: 19 }, { mes: 8, cantidad: 24 }, { mes: 9, cantidad: 16 },
      { mes: 10, cantidad: 20 }, { mes: 11, cantidad: 14 }, { mes: 12, cantidad: 11 }
    ];

    this.eventosRecientes = [];
  }



  iniciarActualizacionAutomatica(): void {
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fechaActual = new Date();
      });

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

  rangoAnosInicial = 2020;
  rangoAnosFinal = new Date().getFullYear() + 2;
  anosDisponibles: number[] = [];

  anosRapidos = [2022, 2023, 2024, 2025];
  anosPreset = [
    { etiqueta: 'Actual', valor: new Date().getFullYear(), descripcion: 'Año en curso' },
  ];

// Métodos para cambiar año
  cambiarAno(evento: any) {
    const nuevoAno = typeof evento === 'number' ? evento : parseInt(evento.target.value);
    if (nuevoAno >= this.rangoAnosInicial && nuevoAno <= this.rangoAnosFinal) {
      this.anoSeleccionado = nuevoAno;
      this.cargarTramitesPorMes();
    }
  }

  private generarRangoAnos() {
    this.anosDisponibles = [];
    for (let ano = this.rangoAnosFinal; ano >= this.rangoAnosInicial; ano--) {
      this.anosDisponibles.push(ano);
    }
  }

  cambiarAnoSlider(evento: any) {
    const nuevoAno = parseInt(evento.target.value);
    this.anoSeleccionado = nuevoAno;
    this.cargarTramitesPorMes();
  }

  navegarAno(direccion: number) {
    const nuevoAno = this.anoSeleccionado + direccion;
    if (nuevoAno >= this.rangoAnosInicial && nuevoAno <= this.rangoAnosFinal) {
      this.anoSeleccionado = nuevoAno;
      this.cargarTramitesPorMes();
    }
  }

  irAnoActual() {
    this.anoSeleccionado = new Date().getFullYear();
    this.cargarTramitesPorMes();
  }

  validarYCambiarAno(evento: any) {
    const ano = parseInt(evento.target.value);
    if (isNaN(ano)) {
      evento.target.value = this.anoSeleccionado;
      return;
    }
    this.cambiarAno(ano);
  }


  private cargarTramitesPorMes() {
    this.dashboardService.getTramitesPorMes(this.token, this.anoSeleccionado, undefined, this.usuarioId ?? undefined) // Pasar usuarioId
      .subscribe({
        next: (data) => {
          this.procesarTramitesPorMes(data);
          this.actualizarGrafico();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar trámites por mes:', error);
          this.notificationService.error('Error', `Error al cargar trámites del año ${this.anoSeleccionado}`);
          this.cargando = false;
        }
      });
  }

  verCalendario(evento?: EventoReciente | EventoDTO): void {
    if (evento) {
      // Verificar si es EventoReciente o EventoDTO
      const eventoId = 'id' in evento ? evento.id : undefined;
      const fechaEvento = evento.fecha;

      if (eventoId && fechaEvento) {
        this.router.navigate(['/main/calendario'], {
          queryParams: {
            eventoId: eventoId,
            fecha: fechaEvento
          }
        });
      } else {
        // Si no tiene ID, solo navegar al calendario sin parámetros
        this.router.navigate(['/main/calendario']);
      }
    } else {
      this.router.navigate(['/main/calendario']);
    }
  }



  nuevoTramite(): void {
    this.router.navigate(['/main/tramites']);
  }

  gestionarDocumentos(): void {
    this.router.navigate(['/main/productos']);
  }

  verNotificaciones(): void {
    this.router.navigate(['/main/notificaciones']);
  }

  configurarSistema(): void {
    this.router.navigate(['/main/configuracion']);
  }

  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad?.toUpperCase()) {
      case 'ALTA':
        return 'prioridad-alta';
      case 'MEDIA':
        return 'prioridad-media';
      case 'BAJA':
        return 'prioridad-baja';
      default:
        return 'prioridad-media';
    }
  }

  obtenerTipoEvento(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'VENCIMIENTO': 'Vencimiento',
      'PLAZO_FINAL': 'Plazo Final',
      'REUNION': 'Reunión',
      'AUDITORIA': 'Auditoría',
      'INSPECCION': 'Inspección',
      'RENOVACION': 'Renovación',
      'REGISTRO_SANITARIO': 'Registro Sanitario',
      'TRAMITE': 'Trámite',
      'SEGUIMIENTO': 'Seguimiento'
    };
    return tipos[tipo] || tipo;
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }
  // Método auxiliar para obtener días restantes
  obtenerDiasRestantes(fecha: string): number {
    const fechaEvento = new Date(fecha);
    const fechaActual = new Date();
    const diferencia = fechaEvento.getTime() - fechaActual.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

// Métodos auxiliares adicionales para el template
  obtenerClaseDiasRestantes(dias: number): string {
    if (dias < 0) return 'dias-vencido';
    if (dias <= 3) return 'dias-critico';
    if (dias <= 7) return 'dias-proximo';
    return 'dias-normal';
  }

  obtenerTextoDiasRestantes(dias: number): string {
    if (dias < 0) return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) > 1 ? 's' : ''}`;
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return `En ${dias} días`;
  }

}
