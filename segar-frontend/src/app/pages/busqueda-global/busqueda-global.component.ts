import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, EMPTY, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {DashboardService, BusquedaGlobalResponseDTO} from '../../core/services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/DTOs/usuario.dto';
import { Router } from '@angular/router';


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
  esDelUsuario: boolean;
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
  filtroSoloMios: boolean = false; // Nuevo filtro
  tabActual: string = 'todos';
  isLoading: boolean = false;
  hasSearched: boolean = false;
  itemsPorPagina: number = 10;
  paginaActual: number = 1;
  loadingMore: boolean = false;
  usuarioId: number | null = null;
  empresaId: number | null = null;

  // Subject para debouncing
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Nuevo: Contador de resultados mostrados por pestaña
  resultadosMostradosPorTab: { [key: string]: number } = {
    'todos': 10,
    'tramites': 10,
    'documentos': 10,
    'usuarios': 10,
    'registros-sanitarios': 10
  };

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

  tabs: Tab[] = [
    { key: 'todos', label: 'Todos', count: 0 },
    { key: 'tramites', label: 'Trámites', count: 0 },
    { key: 'documentos', label: 'Documentos', count: 0 },
    { key: 'usuarios', label: 'Usuarios', count: 0 },
    { key: 'registros-sanitarios', label: 'Registros Sanitarios', count: 0 }
  ];

  // Propiedad para almacenar usuarios
  usuarios: Usuario[] = [];

  token = '';

  constructor(private dashboardService: DashboardService, private authService: AuthService, private usuarioService: UsuarioService,  private router: Router) {}

  ngOnInit(): void {
    // Cargar datos iniciales al inicializar el componente
    this.token = this.authService.getToken()!;
    this.authService.getUsuarioId().subscribe(id => {
      this.usuarioId = id;
      if (id) {
        this.usuarioService.getEmpresaByUsuarioId(id, this.token).subscribe(empresa => {
          this.empresaId = empresa.id;
          this.cargarDatosIniciales();
        });
      } else {
        this.cargarDatosIniciales();
      }
    });

    // Configurar búsqueda con debouncing
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((a: string, b: string) => a === b),
      switchMap((query: string) => {
        if (query.trim().length >= 2) {
          this.isLoading = true;
          return this.dashboardService.busquedaGlobal(this.token, query, 10, 10, this.empresaId ?? undefined);
        } else {
          this.isLoading = false;
          this.hasSearched = false;
          this.resultados = [];
          this.actualizarContadores();
          return EMPTY;
        }
      })
    ).subscribe({
      next: (response: BusquedaGlobalResponseDTO) => {
        this.procesarResultadosBackend(response, this.searchQuery.trim());
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

  //  método para manejar la navegación
  navigateToResult(resultado: ResultadoBusqueda): void {
    const id = +resultado.id; // Convierte el ID a número
    if (resultado.tipo === 'Trámite') {
      if (resultado.estado === 'pendiente') {
        this.router.navigate(['/main/nuevo/registro/paso-2', id]);
      } else if (resultado.estado === 'completado') {
        this.router.navigate(['/main/nuevo/registro/paso-3', id]);
      }
    } else if (resultado.tipo === 'Registro Sanitario') {
      this.router.navigate(['/main/nuevo/registro/paso-3', id]);
    }
  }

  private cargarDatosIniciales(): void {
    this.isLoading = true;
    this.paginaActual = 1;

    const requests = forkJoin({
      busqueda: this.dashboardService.busquedaGlobal(this.token, '', this.itemsPorPagina, this.itemsPorPagina, this.empresaId ?? undefined),
      usuarios: this.empresaId ? this.usuarioService.getUsuariosByEmpresaId(this.empresaId, this.token) : of([])
    });

    requests.subscribe({
      next: (data) => {
        this.totalTramitesBackend = data.busqueda.totalTramites || 0;
        this.totalRegistrosBackend = data.busqueda.totalRegistros || 0;

        if (!data.busqueda.tramites?.length && !data.busqueda.registros?.length) {
          this.cargarDatosMuestra();
        } else {
          this.procesarResultadosIniciales(data.busqueda);
        }

        // Procesar usuarios
        this.procesarUsuarios(data.usuarios);

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

  private procesarUsuarios(usuarios: Usuario[]): void {
    this.usuarios = usuarios;
    const resultadosUsuarios: ResultadoBusqueda[] = usuarios.map(usuario => ({
      id: usuario.id.toString(),
      tipo: 'Usuario',
      titulo: `${usuario.firstName} ${usuario.lastName}`,
      descripcion: `Email: ${usuario.email} | Rol: ${usuario.role}`,
      estado: 'activo', // Asumir estado activo por defecto
      responsable: 'Empresa',
      fecha: new Date(), // Usar fecha de creación si está disponible
      esDelUsuario: false // Ajustar según lógica de negocio
    }));

    // Agregar usuarios a todosLosResultados
    this.todosLosResultados = [...this.todosLosResultados, ...resultadosUsuarios];
    this.aplicarFiltrosYPaginacion();
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
        radicadoNumber: tramite.radicadoNumber,
        esDelUsuario: true
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
        numeroRegistro: registro.numeroRegistro,
        esDelUsuario: true
      });
    });

    // Poblar todosLosResultados con datos iniciales
    this.todosLosResultados = [...resultadosBackend];

    // Aplicar filtros y paginación a los datos iniciales
    this.aplicarFiltrosYPaginacion();
  }

  private cargarDatosMuestra(): void {
    // Si no hay datos del backend, mostrar array vacío
    this.todosLosResultados = [];
    this.resultados = [];
    this.actualizarContadores();
  }

  private procesarResultadosBackend(response: BusquedaGlobalResponseDTO, query: string = ''): void {
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
        radicadoNumber: tramite.radicadoNumber,
        esDelUsuario: true
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
        numeroRegistro: registro.numeroRegistro,
        esDelUsuario: true
      });
    });

    // Filtrar usuarios si hay query
    let usuariosFiltrados: ResultadoBusqueda[] = [];
    if (query.trim()) {
      usuariosFiltrados = this.usuarios
        .filter((u: Usuario) => this.matchesQuery(u, query))
        .map(u => this.mapUsuarioToResultado(u));
    } else {
      // Para carga inicial, incluir todos los usuarios
      usuariosFiltrados = this.usuarios.map(u => this.mapUsuarioToResultado(u));
    }

    // Combinar resultados
    this.todosLosResultados = [...resultadosBackend, ...usuariosFiltrados];
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

  private matchesQuery(usuario: Usuario, query: string): boolean {
    const q = query.toLowerCase();
    return (
      usuario.firstName?.toLowerCase().includes(q) ||
      usuario.lastName?.toLowerCase().includes(q) ||
      usuario.email?.toLowerCase().includes(q)
    );
  }

  private mapUsuarioToResultado(usuario: Usuario): ResultadoBusqueda {
    return {
      id: usuario.id.toString(),
      tipo: 'Usuario',
      titulo: `${usuario.firstName} ${usuario.lastName}`,
      descripcion: `Email: ${usuario.email} | Rol: ${usuario.role}`,
      estado: 'activo',
      responsable: 'Empresa',
      fecha: new Date(), // Ajusta si hay fecha de creación
      esDelUsuario: false
    };
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
      return this.resultados.slice(0, this.resultadosMostradosPorTab[this.tabActual]);
    }

    const filtrados = this.resultados.filter(r => this.tipoAClave(r.tipo) === this.tabActual);
    return filtrados.slice(0, this.resultadosMostradosPorTab[this.tabActual]);
  }

  // Getter para saber cuántos resultados hay en total para la tab actual
  get totalResultadosTabActual(): number {
    if (this.tabActual === 'todos') {
      return this.resultados.length;
    }
    return this.resultados.filter(r => this.tipoAClave(r.tipo) === this.tabActual).length;
  }

  // Nuevo getter para verificar si hay más resultados en la tab actual
  get hayMasResultadosEnTab(): boolean {
    const totalEnTab = this.totalResultadosTabActual;
    const mostrados = this.resultadosMostradosPorTab[this.tabActual];

    // Si los resultados mostrados ya son iguales o mayores al total en la tab, verificar backend
    if (mostrados < totalEnTab) {
      return true;
    }

    // Ya mostramos todos los resultados locales de esta tab
    // Ahora verificar si hay más en el backend según la tab actual
    if (this.tabActual === 'tramites') {
      const tramitesTotalesBackend = this.contarTipoEnResultados('Trámite');
      return tramitesTotalesBackend < this.totalTramitesBackend;
    } else if (this.tabActual === 'registros-sanitarios') {
      const registrosTotalesBackend = this.contarTipoEnResultados('Registro Sanitario');
      return registrosTotalesBackend < this.totalRegistrosBackend;
    } else if (this.tabActual === 'todos') {
      // Para "todos", verificar si hay más de cualquier tipo en backend
      const tramitesTotales = this.contarTipoEnResultados('Trámite');
      const registrosTotales = this.contarTipoEnResultados('Registro Sanitario');
      return tramitesTotales < this.totalTramitesBackend || registrosTotales < this.totalRegistrosBackend;
    }

    // Para documentos y usuarios (datos quemados), no hay más que cargar
    return false;
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

  cambiarTab(tab: string): void {
    this.tabActual = tab;
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.filtroSoloMios = false; // Reset del filtro
    this.searchQuery = '';
    this.paginaActual = 1;
    this.tiposFiltro.forEach(tipo => tipo.selected = true);
    this.todosLosResultados = [];
    this.resultados = [];
    this.hasSearched = false;

    // Resetear contadores de resultados mostrados por pestaña
    this.resultadosMostradosPorTab = {
      'todos': 10,
      'tramites': 10,
      'documentos': 10,
      'usuarios': 10,
      'registros-sanitarios': 10
    };

    this.cargarDatosIniciales();
  }

  aplicarFiltros(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.searchSubject.next(this.searchQuery.trim());
    } else {
      // Aplicar filtros a los datos actuales sin nueva búsqueda
      this.aplicarFiltrosYPaginacion();
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

    // Aplicar filtro "Solo míos"
    if (this.filtroSoloMios) {
      resultadosFiltrados = resultadosFiltrados.filter(r => r.esDelUsuario);
    }

    // CAMBIO: Guardar TODOS los resultados filtrados (sin paginación)
    // La paginación se maneja por pestaña en el getter resultadosFiltrados
    this.resultados = resultadosFiltrados;
    this.totalResultados = resultadosFiltrados.length;

    this.actualizarContadores();
  }

  // Método para cargar más resultados
  cargarMasResultados(): void {
    if (this.loadingMore) return;

    const totalEnTab = this.totalResultadosTabActual;
    const mostrados = this.resultadosMostradosPorTab[this.tabActual];

    // Si hay más resultados locales para mostrar en esta pestaña
    if (mostrados < totalEnTab) {
      this.resultadosMostradosPorTab[this.tabActual] += 10;
      return;
    }

    // Si no hay más resultados locales, intentar cargar del backend
    const hayMasTramitesEnBackend = this.contarTipoEnResultados('Trámite') < this.totalTramitesBackend;
    const hayMasRegistrosEnBackend = this.contarTipoEnResultados('Registro Sanitario') < this.totalRegistrosBackend;

    if (hayMasTramitesEnBackend || hayMasRegistrosEnBackend) {
      this.cargarMasDelBackend();
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
      this.token,
      query,
      this.itemsPorPagina,
      this.itemsPorPagina,
      this.empresaId ?? undefined
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

        this.procesarResultadosBackend(responseNuevos, query);
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
    const totalElementosMostrados = this.paginaActual * this.itemsPorPagina;
    const totalDisponibleLocal = this.todosLosResultados.length;
    const hayMasEnBackend = this.contarTipoEnResultados('Trámite') < this.totalTramitesBackend ||
      this.contarTipoEnResultados('Registro Sanitario') < this.totalRegistrosBackend;

    return totalElementosMostrados < totalDisponibleLocal || hayMasEnBackend;
  }
}
