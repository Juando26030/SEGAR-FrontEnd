import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarioService } from '../../core/services/calendario.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import {interval, Subject, takeUntil} from 'rxjs';


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

interface EstadisticasDocumentos {
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
export class DashboardComponent implements OnInit {
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
    ingresosMes: 0,
    gastosMes: 0,
    utilidadMes: 0,
    crecimientoMensual: 0
  };

  documentos: EstadisticasDocumentos = {
    total: 0,
    vigentes: 0,
    porVencer: 0,
    vencidos: 0
  };

  eventosRecientes: EventoReciente[] = [];

  // Datos para gráficos
  datosVentas = [65, 78, 90, 81, 56, 85, 92];
  labelesVentas = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(
    private calendarioService: CalendarioService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
    this.iniciarActualizacionAutomatica();

  }

  async cargarDatosDashboard() {
    try {
      this.cargando = true;

      // Simular carga de datos (reemplaza con llamadas a tus servicios)
      await this.cargarEstadisticasTramites();
      await this.cargarEstadisticasFinancieras();
      await this.cargarEstadisticasDocumentos();
      await this.cargarEventosRecientes();

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      this.notificationService.error('Error', 'Error al cargar los datos del dashboard');
    } finally {
      this.cargando = false;
    }
  }

  private async cargarEstadisticasTramites() {
    // Simular datos - reemplaza con tu servicio real
    this.tramites = {
      total: 156,
      pendientes: 23,
      enProceso: 45,
      completados: 78,
      rechazados: 10
    };
  }

  private async cargarEstadisticasFinancieras() {
    this.finanzas = {
      ingresosMes: 2450000,
      gastosMes: 1890000,
      utilidadMes: 560000,
      crecimientoMensual: 12.5
    };
  }

  private async cargarEstadisticasDocumentos() {
    this.documentos = {
      total: 89,
      vigentes: 72,
      porVencer: 12,
      vencidos: 5
    };
  }

  private async cargarEventosRecientes() {
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
  }
  obtenerPorcentajeTramites(valor: number): number {
    return this.tramites.total > 0 ? (valor / this.tramites.total) * 100 : 0;
  }

  obtenerPorcentajeDocumentos(valor: number): number {
    return this.documentos.total > 0 ? (valor / this.documentos.total) * 100 : 0;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  verCalendario() {
    // Navegar al calendario
    console.log('Navegar a calendario');
    this.router.navigate(['/main/calendario']);

  }
// Métodos para accesos rápidos
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

}
