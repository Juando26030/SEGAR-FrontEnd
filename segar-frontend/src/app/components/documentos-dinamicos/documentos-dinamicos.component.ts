import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoRequerido, ResultadoClasificacion } from '../../core/services/tramite-invima.service';

@Component({
  selector: 'app-documentos-dinamicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos-dinamicos.component.html',
  styleUrls: ['./documentos-dinamicos.component.css']
})
export class DocumentosDinamicosComponent implements OnInit {
  @Input() resultado!: ResultadoClasificacion;
  @Output() documentoCompletado = new EventEmitter<{ documentoId: string; datos: any }>();
  @Output() todosCompletados = new EventEmitter<boolean>();

  documentoSeleccionado: DocumentoRequerido | null = null;
  datosDocumentos: { [key: string]: any } = {};
  estadoDocumentos: { [key: string]: { completo: boolean; progreso: number } } = {};
  vistaActual: 'lista' | 'formulario' = 'lista';

  // Filtros
  filtroCategoria: string = 'todos';
  filtroTipo: string = 'todos';
  busqueda: string = '';

  ngOnInit() {
    this.inicializarEstados();
  }

  private inicializarEstados() {
    this.resultado.documentos.forEach(doc => {
      this.estadoDocumentos[doc.id] = {
        completo: false,
        progreso: 0
      };
      this.datosDocumentos[doc.id] = {};
    });
  }

  get documentosFiltrados(): DocumentoRequerido[] {
    return this.resultado.documentos.filter(doc => {
      const cumpleCategoria = this.filtroCategoria === 'todos' || doc.categoria === this.filtroCategoria;
      const cumpleTipo = this.filtroTipo === 'todos' || doc.tipo === this.filtroTipo;
      const cumpleBusqueda = !this.busqueda ||
        doc.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        doc.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());

      return cumpleCategoria && cumpleTipo && cumpleBusqueda;
    });
  }

  get categorias(): string[] {
    const cats = new Set(this.resultado.documentos.map(d => d.categoria));
    return Array.from(cats);
  }

  get documentosPorCategoria() {
    const categorias = this.categorias;
    const resultado: { [key: string]: DocumentoRequerido[] } = {};

    categorias.forEach(cat => {
      resultado[cat] = this.documentosFiltrados.filter(d => d.categoria === cat);
    });

    return resultado;
  }

  get progresoTotal(): number {
    const documentosObligatorios = this.resultado.documentos.filter(d => d.obligatorio);
    if (documentosObligatorios.length === 0) return 0;

    const completados = documentosObligatorios.filter(d => this.estadoDocumentos[d.id]?.completo).length;
    return Math.round((completados / documentosObligatorios.length) * 100);
  }

  get documentosCompletados(): number {
    return Object.values(this.estadoDocumentos).filter(e => e.completo).length;
  }

  get documentosObligatorios(): number {
    return this.resultado.documentos.filter(d => d.obligatorio).length;
  }

  seleccionarDocumento(documento: DocumentoRequerido) {
    this.documentoSeleccionado = documento;
    this.vistaActual = 'formulario';
  }

  volverALista() {
    this.vistaActual = 'lista';
    this.documentoSeleccionado = null;
  }

  guardarDocumento() {
    if (!this.documentoSeleccionado) return;

    const docId = this.documentoSeleccionado.id;
    const datos = this.datosDocumentos[docId];

    // Validar campos requeridos
    const camposRequeridos = this.documentoSeleccionado.campos.filter(c => c.requerido);
    const camposCompletos = camposRequeridos.filter(c => datos[c.nombre] && datos[c.nombre] !== '');

    const progreso = Math.round((camposCompletos.length / camposRequeridos.length) * 100);
    const completo = progreso === 100;

    this.estadoDocumentos[docId] = {
      completo,
      progreso
    };

    this.documentoCompletado.emit({ documentoId: docId, datos });

    // Verificar si todos los obligatorios están completos
    this.verificarCompletitudTotal();

    alert(completo ? '✅ Documento guardado correctamente' : '⚠️ Complete todos los campos obligatorios');

    if (completo) {
      this.volverALista();
    }
  }

  private verificarCompletitudTotal() {
    const obligatorios = this.resultado.documentos.filter(d => d.obligatorio);
    const todosCompletos = obligatorios.every(d => this.estadoDocumentos[d.id]?.completo);
    this.todosCompletados.emit(todosCompletos);
  }

  onArchivoSeleccionado(event: any, campo: string) {
    if (!this.documentoSeleccionado) return;

    const file = event.target.files[0];
    if (file) {
      this.datosDocumentos[this.documentoSeleccionado.id][campo] = {
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
        archivo: file
      };
    }
  }

  getIconClass(icono?: string): string {
    return `fas fa-${icono || 'file'}`;
  }

  getCategoriaLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      'basico': 'Documentos Básicos',
      'analisis': 'Análisis de Laboratorio',
      'certificacion': 'Certificaciones',
      'estudios': 'Estudios Especializados',
      'otros': 'Otros Documentos'
    };
    return labels[categoria] || categoria;
  }

  getCategoriaColor(categoria: string): string {
    const colores: { [key: string]: string } = {
      'basico': 'blue',
      'analisis': 'green',
      'certificacion': 'purple',
      'estudios': 'orange',
      'otros': 'gray'
    };
    return colores[categoria] || 'gray';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'autogenerado' ? 'Autogenerado' : 'Externo';
  }

  descargarPlantilla(documento: DocumentoRequerido) {
    // Aquí se implementaría la descarga de plantilla
    alert(`Descargando plantilla para: ${documento.nombre}`);
  }
}
