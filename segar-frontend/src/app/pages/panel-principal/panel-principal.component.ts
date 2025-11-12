import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, interval, takeUntil, forkJoin, timer } from 'rxjs';
import { DashboardService, TramiteRecienteDTO } from '../../core/services/dashboard.service';
import { TramiteDetalleModalComponent } from '../../shared/tramite-detalle-modal/tramite-detalle-modal.component';
import { AuthService } from '../../auth/services/auth.service';

interface Estadisticas {
  activos: number;
  pendientes: number;
  vencimientos: number;
  completados: number;
}

interface Tramite {
  id: number;
  numero: string;
  tipo: string;
  producto: string;
  riesgo: string;
  ultimaActualizacion: Date;
  estado: string;
}

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule,TramiteDetalleModalComponent],
  templateUrl: './panel-principal.component.html',
  styleUrls: ['./panel-principal.component.css']
})
export class PanelPrincipalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  fechaActual: Date = new Date();
  ultimaActualizacion: Date = new Date();

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  tramitesOriginales: Tramite[] = []; // Para mantener una copia original


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
  isRefreshing = false;


  private usuarioId: number | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService
) {}

  ngOnInit(): void {
    this.authService.getUsuarioId().subscribe(id => {
      this.usuarioId = id;
      this.cargarDatos();
    });
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
      resumen: this.dashboardService.getResumen(undefined, undefined, this.usuarioId ?? undefined),
      tramitesPorEstado: this.dashboardService.getTramitesPorEstado(undefined, this.usuarioId ?? undefined),
      tramitesRecientes: this.dashboardService.getTramitesRecientes(5, undefined, this.usuarioId ?? undefined)
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
          activos,
          pendientes,
          vencimientos,
          completados
        };

        console.log('Estadísticas mapeadas:', this.estadisticas);

        // Mapear trámites recientes con las propiedades correctas del backend
        const tramitesMappeados = data.tramitesRecientes.map((tramite: TramiteRecienteDTO) => ({
          numero: tramite.radicadoNumber,
          tipo: this.extraerTipoProceso(tramite.procedureType),
          producto: tramite.productName,
          riesgo: this.extraerRiesgoAlimento(tramite.procedureType),
          ultimaActualizacion: this.validarFecha(tramite.lastUpdate),
          estado: this.dashboardService.mapearEstado(tramite.currentStatus),
          id: tramite.id
        }));

        // Guardar copia original y aplicar ordenamiento si existe
        this.tramitesOriginales = [...tramitesMappeados];
        this.tramitesRecientes = [...tramitesMappeados];

        if (this.sortField) {
          this.aplicarOrdenamiento();
        }

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


  // Extrae la primera parte antes del "-" del procedureType
  private extraerTipoProceso(procedureType: string): string {
    if (!procedureType) return '';
    const partes = procedureType.split(' - ');
    return partes[0] || procedureType;
  }

  // Extrae la palabra final de la parte después del "-"
  private extraerRiesgoAlimento(procedureType: string): string {
    if (!procedureType) return '';
    const partes = procedureType.split(' - ');
    if (partes.length > 1) {
      const parteDespuesGuion = partes[1];
      const palabras = parteDespuesGuion.split(' ');
      return palabras[palabras.length - 1] || '';
    }
    return '';
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

  actualizarDatos(): void {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    console.log('Actualizando datos manualmente...');
    this.cargarDatos();
  }

  private validarFecha(fechaString: any): Date {
    if (!fechaString) {
      return new Date();
    }

    const fecha = new Date(fechaString);

    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida recibida:', fechaString);
      return new Date();
    }

    return fecha;
  }

  iniciarActualizacionAutomatica(): void {
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fechaActual = new Date();
      });

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
      'Aprobado': 'estado-completado',
      'Rechazado': 'estado-vencido'
    };

    return estadoMap[estado] || 'estado-pendiente';
  }

  getRiesgoClass(riesgo: string): string {
    const riesgoMap: { [key: string]: string } = {
      'Alto': 'prioridad-alta',
      'Medio': 'prioridad-media',
      'Bajo': 'prioridad-baja'
    };

    return riesgoMap[riesgo] || 'prioridad-media';
  }


  verTodosTramites(): void {
    console.log('Navegar a todos los trámites');
    this.router.navigate(['/main/tramites']);
  }

  exportarDatos(): void {
    console.log('Exportar datos del dashboard');
  }

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

  ordenarTabla(campo: string): void {
    if (this.sortField === campo) {
      // Si es la misma columna, cambiar dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nueva columna, ordenar ascendente
      this.sortField = campo;
      this.sortDirection = 'asc';
    }

    this.aplicarOrdenamiento();
  }

  private aplicarOrdenamiento(): void {
    this.tramitesRecientes = [...this.tramitesOriginales].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortField) {
        case 'numero':
          valorA = a.numero;
          valorB = b.numero;
          break;
        case 'tipo':
          valorA = a.tipo.toLowerCase();
          valorB = b.tipo.toLowerCase();
          break;
        case 'producto':
          valorA = a.producto.toLowerCase();
          valorB = b.producto.toLowerCase();
          break;
        case 'riesgo':
          // Ordenar por nivel de riesgo: Alto > Medio > Bajo
          const riesgoOrder = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
          valorA = riesgoOrder[a.riesgo as keyof typeof riesgoOrder] || 0;
          valorB = riesgoOrder[b.riesgo as keyof typeof riesgoOrder] || 0;
          break;
        case 'ultimaActualizacion':
          valorA = new Date(a.ultimaActualizacion).getTime();
          valorB = new Date(b.ultimaActualizacion).getTime();
          break;
        case 'estado':
          valorA = a.estado.toLowerCase();
          valorB = b.estado.toLowerCase();
          break;
        default:
          return 0;
      }

      // Comparación
      if (valorA < valorB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSortIcon(campo: string): string {
    if (this.sortField !== campo) {
      return 'fas fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  getSortClass(campo: string): string {
    return this.sortField === campo ? 'sorted' : '';
  }

// Agregar las propiedades para el modal
  modalVisible: boolean = false;
  tramiteSeleccionadoId: number | null = null;

// Actualizar el método verDetalleTramite
  verDetalleTramite(tramite: Tramite): void {
    this.tramiteSeleccionadoId = tramite.id;
    this.modalVisible = true;
  }

// Método para cerrar el modal
  cerrarModal(): void {
    this.modalVisible = false;
    this.tramiteSeleccionadoId = null;
  }

  // Método para editar trámite
  editarTramite(tramite: any): void {
    const id = +tramite.id;
    console.log('Editar trámite con ID:', id);
    console.log("El estado del tramite es: ", tramite.estado, "")
    if (tramite.estado === 'Radicado' || tramite.estado === 'En Evaluación Técnica' || tramite.estado === 'Requiere Información') {
      console.log("llegaste hasta aqui primer if")
      this.router.navigate(['/main/nuevo/registro/paso-2', id]);
    } else if (tramite.estado === 'Aprobado' || tramite.estado === 'Rechazado') {
      console.log("llegaste hasta aqui segundo if")
      this.router.navigate(['/main/nuevo/registro/paso-3', id]);
    }
  }


}


