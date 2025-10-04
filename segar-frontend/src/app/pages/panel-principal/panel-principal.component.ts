import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, interval, takeUntil, forkJoin, timer } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';

interface Estadisticas {
  activos: number;
  pendientes: number;
  vencimientos: number;
  completados: number;
}

interface Tramite {
  numero: string;
  tipo: string;
  cliente: string;
  estado: string;
  fechaVencimiento: Date;
  prioridad: string;
}

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-principal.component.html',
  styleUrls: ['./panel-principal.component.css']
})
export class PanelPrincipalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  fechaActual: Date = new Date();
  ultimaActualizacion: Date = new Date();

  estadisticasAnimadas: Estadisticas = {
    activos: 0,
    pendientes: 0,
    vencimientos: 0,
    completados: 0
  };

  estadisticas: Estadisticas = {
    activos: 0,
    pendientes: 0,
    vencimientos: 0,
    completados: 0
  };

  tramitesRecientes: Tramite[] = [];
  isLoading = true;
  isRefreshing = false; // Para el botón de actualizar

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarActualizacionAutomatica();
    this.iniciarAnimaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    this.isLoading = true;

    forkJoin({
      resumen: this.dashboardService.getResumen(),
      tramitesPorEstado: this.dashboardService.getTramitesPorEstado(),
      requerimientos: this.dashboardService.getRequerimientosPendientes()
    }).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del backend:', data);

        // Calcular estadísticas según la lógica de negocio
        const tramitesPorEstado = data.resumen.tramitesPorEstado || [];

        // Activos: RADICADO + EN_EVALUACION_TECNICA + REQUIERE_INFORMACION
        const activos = tramitesPorEstado
          .filter((item: any) => ['RADICADO', 'EN_EVALUACION_TECNICA', 'REQUIERE_INFORMACION'].includes(item.estado))
          .reduce((sum: number, item: any) => sum + item.cantidad, 0);

        // Pendientes de revisión: solo REQUIERE_INFORMACION
        const pendientes = tramitesPorEstado
          .filter((item: any) => item.estado === 'REQUIERE_INFORMACION')
          .reduce((sum: number, item: any) => sum + item.cantidad, 0);

        // Completados: APROBADO
        const completados = tramitesPorEstado
          .filter((item: any) => item.estado === 'APROBADO')
          .reduce((sum: number, item: any) => sum + item.cantidad, 0);

        // Vencimientos próximos: registrosPorVencer
        const vencimientos = data.resumen.registrosPorVencer || 0;

        this.estadisticas = {
          activos: activos,
          pendientes: pendientes,
          vencimientos: vencimientos,
          completados: completados
        };

        console.log('Estadísticas mapeadas:', this.estadisticas);

        // Mapear requerimientos
        this.tramitesRecientes = data.requerimientos.map((req: any) => ({
          numero: req.number || req.numeroTramite,
          tipo: req.title || req.tipoTramite,
          cliente: req.solicitante || 'Cliente no especificado',
          estado: this.getEstadoTexto(req.status || req.estado),
          fechaVencimiento: this.validarFecha(req.deadline || req.fechaVencimiento),
          prioridad: this.obtenerPrioridadPorFecha(req.deadline || req.fechaVencimiento)
        }));

        console.log('Trámites recientes mapeados:', this.tramitesRecientes);

        // Actualizar timestamp de última actualización
        this.ultimaActualizacion = new Date();
        this.isLoading = false;
        this.isRefreshing = false;
        // Animar los contadores hacia los nuevos valores
        this.animarContadores();
      },
      error: (error: any) => {
        console.error('Error cargando datos del dashboard:', error);
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  animarContadores(): void {
    // Animar cada estadística individualmente
    this.animarValor('activos');
    this.animarValor('pendientes');
    this.animarValor('vencimientos');
    this.animarValor('completados');
  }

  private animarValor(campo: keyof Estadisticas): void {
    const valorFinal = this.estadisticas[campo];
    const valorActual = this.estadisticasAnimadas[campo];

    if (valorFinal === valorActual) return;

    const diferencia = valorFinal - valorActual;
    const pasos = 20;
    const incremento = diferencia / pasos;
    let contador = 0;

    const timer = setInterval(() => {
      contador++;
      if (contador >= pasos) {
        this.estadisticasAnimadas[campo] = valorFinal;
        clearInterval(timer);
      } else {
        this.estadisticasAnimadas[campo] = Math.round(valorActual + (incremento * contador));
      }
    }, 30);
  }

  // Método para el botón de actualizar manual
  actualizarDatos(): void {
    if (this.isRefreshing) return; // Evitar múltiples clicks

    this.isRefreshing = true;
    console.log('Actualizando datos manualmente...');
    this.cargarDatos();
  }

  private getEstadoTexto(estado: string): string {
    const estadoTextoMap: { [key: string]: string } = {
      'RADICADO': 'Radicado',
      'EN_EVALUACION_TECNICA': 'En Evaluación Técnica',
      'REQUIERE_INFORMACION': 'Requiere Información',
      'APROBADO': 'Aprobado',
      'RECHAZADO': 'Rechazado'
    };

    return estadoTextoMap[estado] || estado;
  }

  private obtenerPrioridadPorFecha(fechaString: any): string {
    if (!fechaString) return 'baja';

    const fecha = new Date(fechaString);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    return this.obtenerPrioridadPorDias(diasRestantes);
  }

  private validarFecha(fechaString: any): Date {
    if (!fechaString) {
      return new Date(); // Fecha actual como fallback
    }

    const fecha = new Date(fechaString);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida recibida:', fechaString);
      return new Date(); // Fecha actual como fallback
    }

    return fecha;
  }

  private obtenerPrioridadPorDias(diasRestantes: number): string {
    if (diasRestantes < 0) return 'alta'; // Vencido
    if (diasRestantes <= 3) return 'alta'; // Próximo a vencer
    if (diasRestantes <= 7) return 'media';
    return 'baja';
  }

  iniciarActualizacionAutomatica(): void {
    // Actualizar fecha cada minuto
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fechaActual = new Date();
      });

    // Recargar datos cada 30 segundos
    timer(30000, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isRefreshing) {
          console.log('Actualización automática cada 30 segundos...');
          this.cargarDatos();
        }
      });
  }

  iniciarAnimaciones(): void {
    // Animar entrada de elementos
    setTimeout(() => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((element, index) => {
        const delay = parseInt(element.getAttribute('data-delay') || '0');
        setTimeout(() => {
          element.classList.add('animate-in');
        }, delay);
      });
    }, 100);
  }



  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'Radicado': 'estado-activo',
      'En Evaluación Técnica': 'estado-activo',
      'Requiere Información': 'estado-pendiente',
      'Aprobado': 'estado-activo',
      'Rechazado': 'estado-vencido'
    };

    return estadoMap[estado] || 'estado-pendiente';
  }

  getPrioridadClass(prioridad: string): string {
    const prioridadMap: { [key: string]: string } = {
      'alta': 'prioridad-alta',
      'media': 'prioridad-media',
      'baja': 'prioridad-baja'
    };

    return prioridadMap[prioridad.toLowerCase()] || 'prioridad-media';
  }

  verDetalleTramite(tramite: Tramite): void {
    console.log('Ver detalle del trámite:', tramite);
    // Implementar navegación al detalle
    // this.router.navigate(['/tramites', tramite.numero]);
  }

  verTodosTramites(): void {
    console.log('Navegar a todos los trámites');
    // this.router.navigate(['/tramites']);
  }

  exportarDatos(): void {
    console.log('Exportar datos del dashboard');
    // Implementar lógica de exportación
  }

  // Método para manejar efectos de ripple en botones
  addRippleEffect(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('btn-ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Método para filtrar trámites por estado
  filtrarPorEstado(estado: string): void {
    console.log('Filtrar por estado:', estado);
    // Implementar lógica de filtrado
  }

  // Método para ordenar tabla
  ordenarTabla(campo: string): void {
    console.log('Ordenar por:', campo);
    // Implementar lógica de ordenamiento
  }
}
