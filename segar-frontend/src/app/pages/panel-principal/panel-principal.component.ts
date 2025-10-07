import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, interval, takeUntil } from 'rxjs';

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

  estadisticas: Estadisticas = {
    activos: 0,
    pendientes: 0,
    vencimientos: 0,
    completados: 0
  };

  tramitesRecientes: Tramite[] = [];
  isLoading = true;

  constructor(private router: Router) {}

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

    // Simular carga de datos
    setTimeout(() => {
      this.estadisticas = {
        activos: 45,
        pendientes: 12,
        vencimientos: 8,
        completados: 156
      };

      this.tramitesRecientes = [
        {
          numero: 'TR-2024-001',
          tipo: 'Licencia de Construcción',
          cliente: 'Constructora ABC S.A.',
          estado: 'En Revisión',
          fechaVencimiento: new Date('2024-02-15'),
          prioridad: 'alta'
        },
        {
          numero: 'TR-2024-002',
          tipo: 'Permiso Ambiental',
          cliente: 'EcoProyectos Ltda.',
          estado: 'Pendiente Documentos',
          fechaVencimiento: new Date('2024-02-20'),
          prioridad: 'media'
        },
        {
          numero: 'TR-2024-003',
          tipo: 'Certificado Técnico',
          cliente: 'Ingeniería Total',
          estado: 'Aprobado',
          fechaVencimiento: new Date('2024-01-30'),
          prioridad: 'baja'
        },
        {
          numero: 'TR-2024-004',
          tipo: 'Autorización Sanitaria',
          cliente: 'Restaurante El Buen Sabor',
          estado: 'Vencido',
          fechaVencimiento: new Date('2024-01-25'),
          prioridad: 'alta'
        },
        {
          numero: 'TR-2024-005',
          tipo: 'Permiso de Funcionamiento',
          cliente: 'Comercial La Esquina',
          estado: 'En Proceso',
          fechaVencimiento: new Date('2024-03-01'),
          prioridad: 'media'
        }
      ];

      this.isLoading = false;
      this.animateCounters();
    }, 1000);
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
        this.cargarDatos();
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

  animateCounters(): void {
    const counters = document.querySelectorAll('.counter[data-target]');

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      const increment = target / 50;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toString();
      }, 30);
    });
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'En Revisión': 'estado-activo',
      'En Proceso': 'estado-activo',
      'Pendiente Documentos': 'estado-pendiente',
      'Aprobado': 'estado-activo',
      'Vencido': 'estado-vencido'
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
