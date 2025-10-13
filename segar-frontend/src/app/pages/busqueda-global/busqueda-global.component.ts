import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ResultadoBusqueda {
  id: string;
  tipo: 'Trámite' | 'Documento' | 'Usuario' | 'Registro Sanitario';
  titulo: string;
  descripcion: string;
  estado: string;
  responsable: string;
  fecha: Date;
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
export class BusquedaGlobalComponent implements OnInit {
  searchQuery: string = '';
  showFilters: boolean = false;
  filtroFecha: string = '';
  filtroEstado: string = '';
  tabActual: string = 'todos';

  tiposFiltro: FiltroTipo[] = [
    { key: 'tramites', label: 'Trámites', selected: true },
    { key: 'documentos', label: 'Documentos', selected: true },
    { key: 'usuarios', label: 'Usuarios', selected: true },
    { key: 'registros-sanitarios', label: 'Registros Sanitarios', selected: true }
  ];

  resultados: ResultadoBusqueda[] = [];
  resultadosOriginales: ResultadoBusqueda[] = [];
  totalResultados: number = 0;

  tabs: Tab[] = [
    { key: 'todos', label: 'Todos', count: 0 },
    { key: 'tramites', label: 'Trámites', count: 0 },
    { key: 'documentos', label: 'Documentos', count: 0 },
    { key: 'usuarios', label: 'Usuarios', count: 0 },
    { key: 'registros-sanitarios', label: 'Registros Sanitarios', count: 0 }
  ];

  ngOnInit(): void {
    this.cargarDatosPrueba();
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

  private cargarDatosPrueba(): void {
    this.resultadosOriginales = [
      {
        id: '1',
        tipo: 'Trámite',
        titulo: 'Solicitud de Licencia de Construcción',
        descripcion: 'Trámite para obtener permiso de construcción de vivienda unifamiliar en sector residencial',
        estado: 'pendiente',
        responsable: 'Juan Pérez García',
        fecha: new Date('2024-01-15')
      },
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
        id: '3',
        tipo: 'Usuario',
        titulo: 'Carlos Rodríguez Mendoza',
        descripcion: 'Arquitecto profesional registrado en el sistema municipal',
        estado: 'activo',
        responsable: 'Sistema Administrativo',
        fecha: new Date('2024-01-08')
      },
      {
        id: '4',
        tipo: 'Trámite',
        titulo: 'Renovación de Patente Comercial',
        descripcion: 'Proceso de renovación anual de patente para actividad comercial',
        estado: 'activo',
        responsable: 'Ana López Silva',
        fecha: new Date('2024-01-12')
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
        id: '6',
        tipo: 'Trámite',
        titulo: 'Permiso de Funcionamiento',
        descripcion: 'Autorización municipal para funcionamiento de establecimiento comercial',
        estado: 'completado',
        responsable: 'Luis Hernández',
        fecha: new Date('2024-01-05')
      },
      {
        id: '7',
        tipo: 'Usuario',
        titulo: 'Ana María Sánchez',
        descripcion: 'Ingeniero civil especialista en proyectos urbanos',
        estado: 'activo',
        responsable: 'Recursos Humanos',
        fecha: new Date('2024-01-03')
      },
      {
        id: '8',
        tipo: 'Documento',
        titulo: 'Estudio de Impacto Ambiental',
        descripcion: 'Evaluación ambiental para proyecto de construcción mayor',
        estado: 'pendiente',
        responsable: 'Departamento Ambiental',
        fecha: new Date('2024-01-20')
      },
      // Nuevos datos para Registros Sanitarios
      {
        id: '9',
        tipo: 'Registro Sanitario',
        titulo: 'Registro Sanitario - Medicamento Genérico ABC',
        descripcion: 'Registro sanitario para medicamento genérico con principio activo paracetamol',
        estado: 'vigente',
        responsable: 'Dr. Roberto Castillo',
        fecha: new Date('2024-01-18')
      },
      {
        id: '10',
        tipo: 'Registro Sanitario',
        titulo: 'Registro Sanitario - Dispositivo Médico XYZ',
        descripcion: 'Registro para dispositivo médico clase II - monitor de presión arterial',
        estado: 'por-vencer',
        responsable: 'Ing. Patricia Vega',
        fecha: new Date('2023-11-15')
      },
      {
        id: '11',
        tipo: 'Registro Sanitario',
        titulo: 'Registro Sanitario - Producto Biológico',
        descripcion: 'Registro sanitario para vacuna contra hepatitis B recombinante',
        estado: 'vigente',
        responsable: 'Dr. Miguel Herrera',
        fecha: new Date('2024-01-22')
      },
      {
        id: '12',
        tipo: 'Registro Sanitario',
        titulo: 'Registro Sanitario - Suplemento Nutricional',
        descripcion: 'Registro para suplemento vitamínico con minerales esenciales',
        estado: 'vencido',
        responsable: 'Dra. Laura Mendez',
        fecha: new Date('2023-06-10')
      },
      {
        id: '13',
        tipo: 'Registro Sanitario',
        titulo: 'Registro Sanitario - Equipo Médico',
        descripcion: 'Registro sanitario para equipo de rayos X portátil uso hospitalario',
        estado: 'en-evaluacion',
        responsable: 'Ing. Carlos Ramírez',
        fecha: new Date('2024-01-25')
      }
    ];

    this.resultados = [...this.resultadosOriginales];
    this.actualizarContadores();
  }

  private actualizarContadores(): void {
    this.totalResultados = this.resultados.length;

    // Actualizar contadores de tabs
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
    if (this.searchQuery.trim()) {
      this.buscarEnResultados(this.searchQuery.trim());
    } else {
      this.resultados = [...this.resultadosOriginales];
      this.actualizarContadores();
    }
  }

  private buscarEnResultados(termino: string): void {
    const terminoNormalizado = this.normalizarTexto(termino);

    this.resultados = this.resultadosOriginales.filter(resultado => {
      return (
        this.normalizarTexto(resultado.titulo).includes(terminoNormalizado) ||
        this.normalizarTexto(resultado.descripcion).includes(terminoNormalizado) ||
        this.normalizarTexto(resultado.responsable).includes(terminoNormalizado) ||
        this.normalizarTexto(resultado.tipo).includes(terminoNormalizado) ||
        this.normalizarTexto(resultado.estado).includes(terminoNormalizado)
      );
    });

    this.aplicarFiltrosActivos();
    this.actualizarContadores();
  }

  private aplicarFiltrosActivos(): void {
    let resultadosFiltrados = [...this.resultados];

    // Filtrar por tipos seleccionados
    const tiposSeleccionados = this.tiposFiltro
      .filter(t => t.selected)
      .map(t => t.key);

    if (tiposSeleccionados.length < this.tiposFiltro.length) {
      resultadosFiltrados = resultadosFiltrados.filter(r => {
        const tipoKey = this.tipoAClave(r.tipo);
        return tiposSeleccionados.includes(tipoKey);
      });
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      resultadosFiltrados = resultadosFiltrados.filter(r =>
        this.normalizarTexto(r.estado) === this.normalizarTexto(this.filtroEstado)
      );
    }

    // Filtrar por fecha
    if (this.filtroFecha) {
      const ahora = new Date();
      resultadosFiltrados = resultadosFiltrados.filter(r => {
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

    this.resultados = resultadosFiltrados;
  }

  cambiarTab(tab: string): void {
    this.tabActual = tab;
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.searchQuery = '';
    this.tiposFiltro.forEach(tipo => tipo.selected = true);
    this.cargarDatosPrueba();
  }

  aplicarFiltros(): void {
    if (this.searchQuery.trim()) {
      this.onSearch();
    } else {
      this.resultados = [...this.resultadosOriginales];
      this.aplicarFiltrosActivos();
      this.actualizarContadores();
    }
  }

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
}
