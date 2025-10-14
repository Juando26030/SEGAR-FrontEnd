import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  DashboardService,
  BusquedaGlobalResponseDTO,
  TramiteBusquedaDTO,
  RegistroBusquedaDTO
} from '../../core/services/dashboard.service';

interface ResultadoBusqueda {
  id: string;
  tipo: 'Trámite' | 'Documento' | 'Usuario' | 'Registro Sanitario';
  titulo: string;
  descripcion: string;
  estado: string;
  responsable: string;
  fecha: Date;
  radicadoNumber?: string;
  numeroRegistro?: string;
}

interface FiltroTipo {
  key: string;
  label: string;
  selected: boolean;
}

interface Tab {
  key: string;
  label: string;
  count: number;
}

@Component({
  selector: 'app-busqueda-global',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './busqueda-global.component.html',
  styleUrls: ['./busqueda-global.component.css']
})
export class BusquedaGlobalComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  showFilters: boolean = false;
  filtroFecha: string = '';
  filtroEstado: string = '';
  tabActual: string = 'todos';
  isLoading: boolean = false;
  hasSearched: boolean = false;
  itemsPorPagina: number = 5;
  paginaActual: number = 1;
  loadingMore: boolean = false;

  // Subject para debouncing
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;



  tiposFiltro: FiltroTipo[] = [
    { key: 'tramites', label: 'Trámites', selected: true },
    { key: 'documentos', label: 'Documentos', selected: true },
    { key: 'usuarios', label: 'Usuarios', selected: true },
    { key: 'registros-sanitarios', label: 'Registros Sanitarios', selected: true }
  ];

  private todosLosResultados: ResultadoBusqueda[] = [];
  resultados: ResultadoBusqueda[] = [];
  totalResultados: number = 0;

  totalTramitesBackend: number = 0;
  totalRegistrosBackend: number = 0;

  // Datos quemados para documentos y usuarios
  private datosQuemadosDocumentos: ResultadoBusqueda[] = [
    {
      id: '2',
      tipo: 'Documento',
      titulo: 'Certificado de Zonificación Municipal',
      descripcion: 'Documento oficial que certifica el uso de suelo permitido según plan regulador',
      estado: 'completado',
      responsable: 'María García López',
      fecha: new Date('2024-01-10')
    },
    {
      id: '5',
      tipo: 'Documento',
      titulo: 'Planos Arquitectónicos Aprobados',
      descripcion: 'Conjunto de planos técnicos aprobados para proyecto residencial',
      estado: 'archivado',
      responsable: 'Pedro Martínez Torres',
      fecha: new Date('2023-12-20')
    },
    {
      id: '8',
      tipo: 'Documento',
      titulo: 'Estudio de Impacto Ambiental',
      descripcion: 'Evaluación ambiental para proyecto de construcción mayor',
      estado: 'pendiente',
      responsable: 'Departamento Ambiental',
      fecha: new Date('2024-01-20')
    }
  ];

  private datosQuemadosUsuarios: ResultadoBusqueda[] = [
    {
      id: '3',
      tipo: 'Usuario',
      titulo: 'Carlos Rodríguez Mendoza',
      descripcion: 'Arquitecto profesional registrado en el sistema municipal',
      estado: 'activo',
      responsable: 'Sistema Administrativo',
      fecha: new Date('2024-01-08')
    },
    {
      id: '7',
      tipo: 'Usuario',
      titulo: 'Ana María Sánchez',
      descripcion: 'Ingeniero civil especialista en proyectos urbanos',
      estado: 'activo',
      responsable: 'Recursos Humanos',
      fecha: new Date('2024-01-03')
    }
  ];

  tabs: Tab[] = [
    { key: 'todos', label: 'Todos', count: 0 },
    { key: 'tramites', label: 'Trámites', count: 0 },
    { key: 'documentos', label: 'Documentos', count: 0 },
    { key: 'usuarios', label: 'Usuarios', count: 0 },
    { key: 'registros-sanitarios', label: 'Registros Sanitarios', count: 0 }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {

    // Cargar datos iniciales al inicializar el componente
    this.cargarDatosIniciales();

    // Configurar búsqueda con debouncing
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length >= 2) {
          this.isLoading = true;
          return this.dashboardService.busquedaGlobal(query, 10, 10);
        } else {
          this.isLoading = false;
          this.hasSearched = false;
          this.resultados = [];
          this.actualizarContadores();
          return [];
        }
      })
    ).subscribe({
      next: (response: BusquedaGlobalResponseDTO) => {
        this.procesarResultadosBackend(response);
        this.isLoading = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isLoading = false;
        this.hasSearched = true;
        this.resultados = [];
        this.actualizarContadores();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private cargarDatosIniciales(): void {
    this.isLoading = true;
    this.paginaActual = 1;

    this.dashboardService.busquedaGlobal('', this.itemsPorPagina, this.itemsPorPagina).subscribe({
      next: (response: BusquedaGlobalResponseDTO) => {
        this.totalTramitesBackend = response.totalTramites || 0;
        this.totalRegistrosBackend = response.totalRegistros || 0;

        if (!response.tramites?.length && !response.registros?.length) {
          this.cargarDatosMuestra();
        } else {
          this.procesarResultadosIniciales(response);
        }
        this.isLoading = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Error cargando datos iniciales:', error);
        this.cargarDatosMuestra();
        this.isLoading = false;
        this.hasSearched = true;
      }
    });
  }

  private procesarResultadosIniciales(response: BusquedaGlobalResponseDTO): void {
    const resultadosBackend: ResultadoBusqueda[] = [];

    // Procesar trámites del backend
    response.tramites.forEach(tramite => {
      resultadosBackend.push({
        id: tramite.id.toString(),
        tipo: 'Trámite',
        titulo: `${tramite.radicadoNumber} - ${tramite.productName}`,
        descripcion: `Tipo: ${this.mapearTipoProcedimiento(tramite.procedureType)}`,
        estado: this.mapearEstadoTramite(tramite.currentStatus),
        responsable: 'Sistema INVIMA',
        fecha: new Date(tramite.lastUpdate),
        radicadoNumber: tramite.radicadoNumber
      });
    });

    // Procesar registros sanitarios del backend
    response.registros.forEach(registro => {
      resultadosBackend.push({
        id: registro.id.toString(),
        tipo: 'Registro Sanitario',
        titulo: `${registro.numeroRegistro} - ${registro.productName}`,
        descripcion: `Estado: ${this.mapearEstadoRegistro(registro.estado)} | Vence: ${this.formatearFecha(registro.fechaVencimiento)}`,
        estado: this.mapearEstadoRegistro(registro.estado),
        responsable: 'INVIMA',
        fecha: new Date(registro.fechaExpedicion),
        numeroRegistro: registro.numeroRegistro
      });
    });

    // Siempre agregar algunos datos quemados para tener contenido
    this.resultados = [...resultadosBackend, ...this.datosQuemadosDocumentos.slice(0, 2), ...this.datosQuemadosUsuarios.slice(0, 2)];
    this.actualizarContadores();
  }

  private cargarDatosMuestra(): void {
    // Si no hay datos del backend, mostrar solo datos quemados
    this.resultados = [...this.datosQuemadosDocumentos, ...this.datosQuemadosUsuarios];
    this.actualizarContadores();
  }

  private procesarResultadosBackend(response: BusquedaGlobalResponseDTO): void {
    this.totalTramitesBackend = response.totalTramites || 0;
    this.totalRegistrosBackend = response.totalRegistros || 0;

    const resultadosBackend: ResultadoBusqueda[] = [];

    // Procesar trámites del backend
    response.tramites.forEach(tramite => {
      resultadosBackend.push({
        id: tramite.id.toString(),
        tipo: 'Trámite',
        titulo: `${tramite.radicadoNumber} - ${tramite.productName}`,
        descripcion: `Tipo: ${this.mapearTipoProcedimiento(tramite.procedureType)}`,
        estado: this.mapearEstadoTramite(tramite.currentStatus),
        responsable: 'Sistema INVIMA',
        fecha: new Date(tramite.lastUpdate),
        radicadoNumber: tramite.radicadoNumber
      });
    });

    // Procesar registros sanitarios del backend
    response.registros.forEach(registro => {
      resultadosBackend.push({
        id: registro.id.toString(),
        tipo: 'Registro Sanitario',
        titulo: `${registro.numeroRegistro} - ${registro.productName}`,
        descripcion: `Estado: ${this.mapearEstadoRegistro(registro.estado)} | Vence: ${this.formatearFecha(registro.fechaVencimiento)}`,
        estado: this.mapearEstadoRegistro(registro.estado),
        responsable: 'INVIMA',
        fecha: new Date(registro.fechaExpedicion),
        numeroRegistro: registro.numeroRegistro
      });
    });

    // Si es la primera página, incluir datos quemados
    if (this.paginaActual === 1) {
      const terminoNormalizado = this.normalizarTexto(this.searchQuery);
      const documentosFiltrados = this.filtrarDatosQuemados(this.datosQuemadosDocumentos, terminoNormalizado);
      const usuariosFiltrados = this.filtrarDatosQuemados(this.datosQuemadosUsuarios, terminoNormalizado);

      if (this.paginaActual === 1) {
        // Primera carga: reemplazar todos los resultados
        this.todosLosResultados = [...resultadosBackend, ...documentosFiltrados, ...usuariosFiltrados];
      } else {
        // Cargar más: agregar a los existentes
        this.todosLosResultados = [...this.todosLosResultados, ...resultadosBackend];
      }
    } else {
      // Páginas siguientes: solo datos del backend
      this.todosLosResultados = [...this.todosLosResultados, ...resultadosBackend];
    }

    this.aplicarFiltrosYPaginacion();
  }

  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private filtrarDatosQuemados(datos: ResultadoBusqueda[], termino: string): ResultadoBusqueda[] {
    return datos.filter(item => {
      return (
        this.normalizarTexto(item.titulo).includes(termino) ||
        this.normalizarTexto(item.descripcion).includes(termino) ||
        this.normalizarTexto(item.responsable).includes(termino)
      );
    });
  }

  private mapearTipoProcedimiento(tipo: string): string {
    const mapeo: { [key: string]: string } = {
      'REGISTRO_SANITARIO': 'Registro Sanitario',
      'MODIFICACION': 'Modificación',
      'RENOVACION': 'Renovación',
      'CANCELACION': 'Cancelación'
    };
    return mapeo[tipo] || tipo;
  }

  private mapearEstadoTramite(estado: string): string {
    const mapeo: { [key: string]: string } = {
      'EN_REVISION': 'pendiente',
      'EN_EVALUACION': 'pendiente',
      'APROBADO': 'completado',
      'RECHAZADO': 'archivado',
      'EN_EVALUACION_TECNICA': 'pendiente',
      'REQUIERE_INFORMACION': 'pendiente',
      'RADICADO': 'pendiente'
    };
    return mapeo[estado] || 'pendiente';
  }

  private mapearEstadoRegistro(estado: string): string {
    const mapeo: { [key: string]: string } = {
      'VIGENTE': 'activo',
      'VENCIDO': 'archivado',
      'POR_VENCER': 'pendiente',
      'SUSPENDIDO': 'archivado',
      'CANCELADO': 'archivado'
    };
    return mapeo[estado] || 'activo';
  }
  // Método para normalizar texto (quitar tildes y caracteres especiales)
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }

  // Método para mapear tipo a clave de filtro
  private tipoAClave(tipo: string): string {
    const mapeo: { [key: string]: string } = {
      'tramite': 'tramites',
      'documento': 'documentos',
      'usuario': 'usuarios',
      'registro sanitario': 'registros-sanitarios'
    };

    const tipoNormalizado = this.normalizarTexto(tipo);
    return mapeo[tipoNormalizado] || tipoNormalizado;
  }

  private actualizarContadores(): void {
    this.totalResultados = this.resultados.length;

    this.tabs = [
      {
        key: 'todos',
        label: 'Todos',
        count: this.resultados.length
      },
      {
        key: 'tramites',
        label: 'Trámites',
        count: this.resultados.filter(r => this.tipoAClave(r.tipo) === 'tramites').length
      },
      {
        key: 'documentos',
        label: 'Documentos',
        count: this.resultados.filter(r => this.tipoAClave(r.tipo) === 'documentos').length
      },
      {
        key: 'usuarios',
        label: 'Usuarios',
        count: this.resultados.filter(r => this.tipoAClave(r.tipo) === 'usuarios').length
      },
      {
        key: 'registros-sanitarios',
        label: 'Registros Sanitarios',
        count: this.resultados.filter(r => this.tipoAClave(r.tipo) === 'registros-sanitarios').length
      }
    ];
  }

  get resultadosFiltrados(): ResultadoBusqueda[] {
    if (this.tabActual === 'todos') {
      return this.resultados;
    }
    return this.resultados.filter(r => this.tipoAClave(r.tipo) === this.tabActual);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    this.paginaActual = 1;
    this.todosLosResultados = [];

    if (query.length >= 2) {
      this.searchSubject.next(query);
    } else if (query.length === 0) {
      this.cargarDatosIniciales();
    }
  }

  private aplicarFiltrosActivos(): void {
    // Aplicar filtros de tipo
    const tiposSeleccionados = this.tiposFiltro
      .filter(t => t.selected)
      .map(t => t.key);

    if (tiposSeleccionados.length < this.tiposFiltro.length) {
      this.resultados = this.resultados.filter(r => {
        const tipoKey = this.tipoAClave(r.tipo);
        return tiposSeleccionados.includes(tipoKey);
      });
    }

    // Aplicar filtro de estado
    if (this.filtroEstado) {
      this.resultados = this.resultados.filter(r =>
        this.normalizarTexto(r.estado) === this.normalizarTexto(this.filtroEstado)
      );
    }

    // Aplicar filtro de fecha
    if (this.filtroFecha) {
      const ahora = new Date();
      this.resultados = this.resultados.filter(r => {
        const fechaResultado = new Date(r.fecha);
        switch (this.filtroFecha) {
          case 'semana':
            const unaSemanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
            return fechaResultado >= unaSemanaAtras;
          case 'mes':
            const unMesAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
            return fechaResultado >= unMesAtras;
          case 'ano':
            const unAnoAtras = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000);
            return fechaResultado >= unAnoAtras;
          default:
            return true;
        }
      });
    }
  }

  cambiarTab(tab: string): void {
    this.tabActual = tab;
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.searchQuery = '';
    this.paginaActual = 1;
    this.tiposFiltro.forEach(tipo => tipo.selected = true);
    this.todosLosResultados = [];
    this.resultados = [];
    this.hasSearched = false;
    this.cargarDatosIniciales();
  }

  aplicarFiltros(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.searchSubject.next(this.searchQuery.trim());
    }
  }

  // Métodos de utilidad mantenidos igual...
  getIconClass(tipo: string): string {
    switch (this.tipoAClave(tipo)) {
      case 'tramites':
        return 'icon-tramite';
      case 'documentos':
        return 'icon-documento';
      case 'usuarios':
        return 'icon-usuario';
      case 'registros-sanitarios':
        return 'icon-registro-sanitario';
      default:
        return 'icon-usuario';
    }
  }

  getIconPath(tipo: string): string {
    switch (this.tipoAClave(tipo)) {
      case 'tramites':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'documentos':
        return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
      case 'usuarios':
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case 'registros-sanitarios':
        return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      default:
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    }
  }

  getStatusClass(estado: string): string {
    const estadoNormalizado = this.normalizarTexto(estado);
    switch (estadoNormalizado) {
      case 'activo':
      case 'vigente':
        return 'status-activo';
      case 'pendiente':
      case 'en-evaluacion':
        return 'status-pendiente';
      case 'completado':
        return 'status-completado';
      case 'archivado':
      case 'vencido':
        return 'status-archivado';
      case 'por-vencer':
        return 'status-warning';
      default:
        return 'status-archivado';
    }
  }

  highlightText(text: string): string {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  // Getter para mostrar mensaje cuando no hay resultados
  get mostrarMensajeSinResultados(): boolean {
    return this.hasSearched && this.resultados.length === 0 && !this.isLoading;
  }

  // Getter para mostrar mensaje de búsqueda mínima
  get mostrarMensajeBusquedaMinima(): boolean {
    return !this.hasSearched && this.searchQuery.trim().length > 0 && this.searchQuery.trim().length < 2;
  }


  private aplicarFiltrosYPaginacion(): void {
    let resultadosFiltrados = [...this.todosLosResultados];

    // Aplicar filtros de tipo
    const tiposSeleccionados = this.tiposFiltro
      .filter(t => t.selected)
      .map(t => t.key);

    if (tiposSeleccionados.length < this.tiposFiltro.length) {
      resultadosFiltrados = resultadosFiltrados.filter(r => {
        const claveTipo = this.tipoAClave(r.tipo);
        return tiposSeleccionados.includes(claveTipo);
      });
    }

    // Aplicar filtro de estado
    if (this.filtroEstado) {
      resultadosFiltrados = resultadosFiltrados.filter(r =>
        this.normalizarTexto(r.estado) === this.normalizarTexto(this.filtroEstado)
      );
    }

    // Aplicar filtro de fecha
    if (this.filtroFecha) {
      const ahora = new Date();
      resultadosFiltrados = resultadosFiltrados.filter(r => {
        const diasDiferencia = Math.floor((ahora.getTime() - r.fecha.getTime()) / (1000 * 60 * 60 * 24));

        switch (this.filtroFecha) {
          case 'hoy': return diasDiferencia === 0;
          case 'semana': return diasDiferencia <= 7;
          case 'mes': return diasDiferencia <= 30;
          default: return true;
        }
      });
    }

    // Mostrar solo los primeros elementos según la página actual
    const elementosAMostrar = this.paginaActual * this.itemsPorPagina;
    this.resultados = resultadosFiltrados.slice(0, elementosAMostrar);
    this.totalResultados = resultadosFiltrados.length;

    this.actualizarContadores();
  }

  // Método para cargar más resultados
  cargarMasResultados(): void {
    if (this.loadingMore) return;

    const hayMasTramitesEnBackend = this.contarTipoEnResultados('Trámite') < this.totalTramitesBackend;
    const hayMasRegistrosEnBackend = this.contarTipoEnResultados('Registro Sanitario') < this.totalRegistrosBackend;

    if (hayMasTramitesEnBackend || hayMasRegistrosEnBackend) {
      // Cargar más datos del backend
      this.cargarMasDelBackend();
    } else {
      // Solo mostrar más de los datos que ya tenemos
      this.paginaActual++;
      this.aplicarFiltrosYPaginacion();
    }
  }

  private cargarMasDelBackend(): void {
    this.loadingMore = true;

    const tramitesActuales = this.contarTipoEnResultados('Trámite');
    const registrosActuales = this.contarTipoEnResultados('Registro Sanitario');

    // Calcular cuántos elementos necesitamos del backend
    const tramitesSkip = Math.max(0, tramitesActuales);
    const registrosSkip = Math.max(0, registrosActuales);

    const query = this.searchQuery.trim() || '';

    this.dashboardService.busquedaGlobal(
      query,
      this.itemsPorPagina,
      this.itemsPorPagina
    ).subscribe({
      next: (response: BusquedaGlobalResponseDTO) => {
        this.paginaActual++;

        // Filtrar solo los elementos nuevos que no están ya en nuestros resultados
        const tramitesNuevos = response.tramites.filter(tramite =>
          !this.todosLosResultados.some(r => r.id === tramite.id.toString() && r.tipo === 'Trámite')
        );

        const registrosNuevos = response.registros.filter(registro =>
          !this.todosLosResultados.some(r => r.id === registro.id.toString() && r.tipo === 'Registro Sanitario')
        );

        // Crear un objeto de respuesta solo con los nuevos
        const responseNuevos: BusquedaGlobalResponseDTO = {
          tramites: tramitesNuevos,
          registros: registrosNuevos,
          totalTramites: response.totalTramites,
          totalRegistros: response.totalRegistros
        };

        this.procesarResultadosBackend(responseNuevos);
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Error cargando más resultados:', error);
        this.loadingMore = false;
      }
    });
  }

  // Método auxiliar para contar tipos en resultados actuales
  private contarTipoEnResultados(tipo: string): number {
    return this.todosLosResultados.filter(r => r.tipo === tipo).length;
  }

  // Getter para saber si hay más resultados disponibles
  get hayMasResultados(): boolean {
    const resultadosVisibles = this.resultados.length;
    const totalDisponible = this.todosLosResultados.length;
    const hayMasEnBackend = this.contarTipoEnResultados('Trámite') < this.totalTramitesBackend ||
      this.contarTipoEnResultados('Registro Sanitario') < this.totalRegistrosBackend;

    return resultadosVisibles < totalDisponible || hayMasEnBackend;
  }
}
