import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { DocumentoRequerido, ResultadoClasificacion } from '../../core/services/tramite-invima.service';
import { AuthService } from '../../auth/services/auth.service';
import { Producto } from '../../core/DTOs/solicitud.dto';

@Component({
  selector: 'app-documentos-dinamicos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './documentos-dinamicos.component.html',
  styleUrls: ['./documentos-dinamicos.component.css']
})
export class DocumentosDinamicosComponent implements OnInit {
  @Input() resultado!: ResultadoClasificacion;
  @Input() producto!: Producto;
  @Input() modoRenovacion: boolean = false;
  @Input() documentosOriginales: any[] = [];
  @Input() reglasBloqueo: string[] = [];
  @Output() documentoCompletado = new EventEmitter<{ documentoId: string; datos: any }>();
  @Output() todosCompletados = new EventEmitter<boolean>();

  documentoSeleccionado: DocumentoRequerido | null = null;
  datosDocumentos: { [key: string]: any } = {};
  estadoDocumentos: { [key: string]: { completo: boolean; progreso: number } } = {};
  archivosSubidos: { [key: string]: File | null } = {}; // Para documentos externos
  vistaActual: 'lista' | 'formulario' | 'upload' = 'lista';

  // Filtros
  filtroCategoria: string = 'todos';
  filtroTipo: string = 'todos';
  busqueda: string = '';

  // Drag and drop
  isDragging: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  ngOnInit() {
    this.inicializarEstados();
    if (this.modoRenovacion) {
      this.cargarDocumentosRenovacion();
      this.aplicarReglasBloqueo();
    }
    console.log("Producto recibido en DocumentosDinamicosComponent:");
    console.log(this.producto);
  }

  private inicializarEstados() {
    this.resultado.documentos.forEach(doc => {
      this.estadoDocumentos[doc.id] = {
        completo: false,
        progreso: 0
      };
      this.datosDocumentos[doc.id] = {};
      this.archivosSubidos[doc.id] = null;
    });
  }

  cargarDocumentosRenovacion(): void {
    this.resultado.documentos.forEach(doc => {
      const docOriginal = this.documentosOriginales.find(
        d => d.tipo === doc.id || d.nombre === doc.nombre
      );

      if (docOriginal) {
        // Prellenar con datos originales
        this.datosDocumentos[doc.id] = { ...docOriginal.datos };
        this.archivosSubidos[doc.id] = docOriginal.archivo || null;
        this.estadoDocumentos[doc.id] = {
          completo: true,
          progreso: 100
        };
      }
    });
  }

  aplicarReglasBloqueo(): void {
    this.resultado.documentos.forEach(doc => {
      doc.campos?.forEach((campo: any) => {
        if (this.reglasBloqueo.includes(campo.nombre)) {
          campo.bloqueado = true;
          campo.tooltip = '🔒 Este campo no puede modificarse en renovación';
        }
      });
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
    // Si es externo, mostrar vista de upload, si es autogenerado mostrar formulario
    this.vistaActual = documento.tipo === 'externo' ? 'upload' : 'formulario';
  }

  volverALista() {
    this.vistaActual = 'lista';
    this.documentoSeleccionado = null;
    this.isDragging = false;
  }

  // Para documentos AUTOGENERADOS (con formulario)
  guardarDocumento() {
    if (!this.documentoSeleccionado || this.documentoSeleccionado.tipo !== 'autogenerado') return;

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

    //this.documentoCompletado.emit({ documentoId: docId, datos });

    // Verificar si todos los obligatorios están completos
    this.verificarCompletitudTotal();

    if (completo) {
      alert('�� Documento guardado correctamente. Se generará automáticamente cuando radique la solicitud.');
      this.volverALista();
    } else {
      alert('⚠️ Complete todos los campos obligatorios marcados con *');
    }
  }

  // Para documentos EXTERNOS (subir archivo)
  onArchivoExternoSeleccionado(event: any) {
    if (!this.documentoSeleccionado || this.documentoSeleccionado.tipo !== 'externo') return;

    const file = event.target.files[0];
    if (file) {
      this.procesarArchivoExterno(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (!this.documentoSeleccionado || this.documentoSeleccionado.tipo !== 'externo') return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivoExterno(files[0]);
    }
  }

  private procesarArchivoExterno(file: File) {
  const token = this.authService.getToken();

  if (!this.documentoSeleccionado) return;

  const docId = this.documentoSeleccionado.id;

  // ✅ Validar formato y tamaño
  const formatoPermitido = this.validarFormatoArchivo(file, this.documentoSeleccionado.formato);
  if (!formatoPermitido) {
    alert(`⚠️ Formato de archivo no válido. Se requiere: ${this.documentoSeleccionado.formato}`);
    return;
  }

  const tamanioMaximo = 10 * 1024 * 1024; // 10MB
  if (file.size > tamanioMaximo) {
    alert('⚠️ El archivo excede el tamaño máximo permitido (10MB)');
    return;
  }

  // ✅ Decodificar token si existe
  let payload = null;
  if (token) {
    payload = this.decodeToken(token);
    console.log('Payload:', payload);
    console.log('Empresa:', payload?.empresa);
  }

  console.log('Trámite seleccionado:', this.resultado.tramite);

  // ✅ Armar información del archivo
  this.archivosSubidos[docId] = file;
  this.datosDocumentos[docId] = {
    nombreArchivo: file.name,
    tipoArchivo: file.type,
    tamanioArchivo: file.size,
    fechaCarga: new Date()
  };

  // ✅ Emitir el archivo al componente padre
  this.documentoCompletado.emit({
    documentoId: docId,
    datos: {
      archivo: file, // 🔥 Aquí va el File real
      metadata: this.datosDocumentos[docId],
      empresa: payload?.empresa || null,
      tramite: this.resultado.tramite
    }
  });

  // ✅ Actualizar estado interno
  this.estadoDocumentos[docId] = {
    completo: true,
    progreso: 100
  };

  this.verificarCompletitudTotal();

  alert('✅ Archivo procesado y enviado al componente padre correctamente.');
  this.volverALista();
}



  private validarFormatoArchivo(file: File, formatoRequerido: string): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const tipo = file.type.toLowerCase();

    switch (formatoRequerido.toUpperCase()) {
      case 'PDF':
        return tipo === 'application/pdf' || extension === 'pdf';
      case 'IMAGE':
        return tipo.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
      case 'WORD':
        return tipo.includes('word') || ['doc', 'docx'].includes(extension);
      case 'EXCEL':
        return tipo.includes('excel') || tipo.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension);
      default:
        return true; // Permitir cualquier formato si no se especifica
    }
  }

  decodeToken(token: string) {
    const payloadBase64 = token.split('.')[1];
    const payloadDecoded = atob(payloadBase64); // decodifica Base64
    return JSON.parse(payloadDecoded);
  }


  eliminarArchivo() {
    if (!this.documentoSeleccionado) return;

    const docId = this.documentoSeleccionado.id;

    if (confirm('¿Está seguro de eliminar este archivo?')) {
      this.archivosSubidos[docId] = null;
      this.datosDocumentos[docId] = {};
      this.estadoDocumentos[docId] = {
        completo: false,
        progreso: 0
      };

      this.verificarCompletitudTotal();
      alert('Archivo eliminado');
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

  formatearTamanioArchivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
