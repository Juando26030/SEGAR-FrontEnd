import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
// Importar componente del sistema de documentos dinámicos
import { DocumentosDinamicosComponent } from '../../../components/documentos-dinamicos/documentos-dinamicos.component';
import { TramiteInvimaService, ClasificacionProducto, ResultadoClasificacion } from '../../../core/services/tramite-invima.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ProductoService } from '../../../core/services/producto.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { DocumentService } from '../../../core/services/document.service';
import { EmailService } from '../../../services/email.service';


interface OptionItem {
  value: string;
  label: string;
}

interface Tab {
  id: string;
  label: string;
}

interface CompletionStep {
  title: string;
  status: string;
}

interface NextStep {
  number: number;
  title: string;
  description: string;
}

interface ClassificationForm {
  productCategory: string;
  riskLevel: string;
  targetPopulation: string;
  processingType: string;
}

interface Manufacturer {
  name: string;
  address: string;
  city: string;
  department: string;
  country: string;
}

interface Importer {
  name: string;
  address: string;
  city: string;
  department: string;
}

interface SolicitudForm {
  procedureType: string;
  procedureMode: string;
  productName: string;
  brandName: string;
  presentation: string;
  manufacturer: Manufacturer;
  isImported: boolean;
  importer: Importer;
  originCountryRegistration: string;
  ingredients: string;
  additives: string;
  shelfLife: number;
  shelfLifeUnit: string;
  storageConditions: string;
  targetPopulationDescription: string;
  hasHealthClaims: boolean;
  healthClaimsDescription: string;
}

interface TramiteResponse {
  id: number;
  radicadoNumber?: string; // Opcional, el backend puede devolverlo o no
  // Agrega otras propiedades si el backend las devuelve
}

@Component({
  standalone: true,
  selector: 'app-registro-paso-tres',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DocumentosDinamicosComponent
  ],
  templateUrl: './registro-paso-tres.component.html',
  styleUrls: ['./registro-paso-tres.component.css']
})
export class RegistroPasoTresComponent implements OnInit, OnDestroy {

  documentosCargados: { documentoId: string; archivo: File }[] = [];

  activeTab = 'clasificacion';


  // Propiedades para el sistema de documentos dinámicos
  tramiteId: number = 1; // TODO: obtener desde ruta o contexto
  currentTramiteType: 'REGISTRO' | 'RENOVACION' | 'MODIFICACION' = 'REGISTRO';

  // Nueva propiedad para el resultado de clasificación
  resultadoClasificacion: ResultadoClasificacion | null = null;
  clasificacionCompleta: boolean = false;
  todosDocumentosCompletos: boolean = false;

  productos: any[] = [];
  productoSeleccionado: any = '';

  token = '';

  constructor(
    private tramiteService: TramiteInvimaService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private documentService: DocumentService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.token = this.authService.getToken()!;
    this.obtenerProductos();

    // Configurar el state para la navegación hacia atrás
    // Cuando el usuario presiona la flecha atrás, debe ir al tab de documentación
    window.history.replaceState(
      { navigationId: 'paso-3', previousTab: 'documentacion' },
      '',
      window.location.href
    );

    // Escuchar el evento popstate (flecha atrás del navegador)
    window.addEventListener('popstate', this.handlePopState);
  }

  ngOnDestroy() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  handlePopState = (event: PopStateEvent) => {
    // Si el usuario presiona la flecha atrás, cambiar al tab de documentación
    if (event.state && event.state.previousTab) {
      this.setActiveTab(event.state.previousTab);
      // Prevenir la navegación por defecto
      window.history.pushState(
        { navigationId: 'paso-3', previousTab: 'documentacion' },
        '',
        window.location.href
      );
    } else if (this.activeTab === 'radicacion') {
      // Si está en radicación, ir a documentación
      this.setActiveTab('documentacion');
      window.history.pushState(
        { navigationId: 'paso-3', previousTab: 'documentacion' },
        '',
        window.location.href
      );
    }
  };

  obtenerProductos(): void {
    this.authService.getUsuarioId().subscribe({
      next: (usuarioId) => {
        if (usuarioId !== null) {
          this.usuarioService.getEmpresaByUsuarioId(usuarioId, this.token).subscribe({
            next: (empresa) => {
              const empresaId = empresa.id;
              this.productoService.getProductosSinTramites(empresaId, this.token).subscribe({
                next: (productos) => {
                  this.productos = productos;
                },
                error: (err) => {
                  console.error('Error al obtener productos sin trámites', err);
                }
              });
            },
            error: (err) => {
              console.error('Error al obtener empresa del usuario', err);
            }
          });
        } else {
          console.error('Usuario ID es null');
        }
      },
      error: (err) => {
        console.error('Error al obtener usuario ID', err);
      }
    });
  }


  onProductoSeleccionado(): void {
    console.log('Producto seleccionado:', this.productoSeleccionado);
  }

  readonly tabs: Tab[] = [
    { id: 'clasificacion', label: 'Clasificación del Producto' },
    { id: 'documentacion', label: 'Documentación Técnica' },
    { id: 'radicacion', label: 'Radicación' }
  ];

  classificationForm: ClassificationForm = {
    productCategory: '',
    riskLevel: '',
    targetPopulation: '',
    processingType: ''
  };

  // Propiedades para control de reglas de negocio automáticas
  riskLevelDisabled: boolean = false;
  riskLevelForzado: string = '';
  mensajeReglaActiva: string = '';

  solicitudForm: SolicitudForm = {
    procedureType: '',
    procedureMode: '',
    productName: '',
    brandName: '',
    presentation: '',
    manufacturer: {
      name: '',
      address: '',
      city: '',
      department: '',
      country: 'Colombia'
    },
    isImported: false,
    importer: {
      name: '',
      address: '',
      city: '',
      department: ''
    },
    originCountryRegistration: '',
    ingredients: '',
    additives: '',
    shelfLife: 0,
    shelfLifeUnit: 'months',
    storageConditions: '',
    targetPopulationDescription: '',
    hasHealthClaims: false,
    healthClaimsDescription: ''
  };

  readonly productCategories: OptionItem[] = [
    { value: 'panaderia', label: 'Panadería' },
    { value: 'galleteria', label: 'Galletería' },
    { value: 'confiteria', label: 'Confiteria' },
    { value: 'lacteos', label: 'Lácteos y derivados' },
    { value: 'carnicos', label: 'Productos cárnicos procesados' },
    { value: 'jugos', label: 'Jugos' },
    { value: 'nectares', label: 'Néctares' },
    { value: 'no-alcoholicas', label: 'Bebidas no alcohólicas' },
    { value: 'infantiles', label: 'bebidas infantiles' },
    { value: 'conservas', label: 'Conservas' },
    { value: 'salsas', label: 'salsas y aderezos' },
    { value: 'listos-consumo', label: 'Alimentos listos para consumo' },
    { value: 'otros', label: 'Otros alimentos procesados' }
  ];

  readonly riskLevels: OptionItem[] = [
    { value: 'alto', label: 'Alto riesgo - Requiere Registro Sanitario (RSA)' },
    { value: 'medio', label: 'Medio riesgo - Requiere Permiso Sanitario (PSA)' },
    { value: 'bajo', label: 'Bajo riesgo - Requiere Notificación Sanitaria (NSO)' }
  ];

  readonly targetPopulations: OptionItem[] = [
    { value: 'general', label: 'Población general' },
    { value: 'infantil', label: 'Alimentación infantil' },
    { value: 'gestantes', label: 'Mujeres gestantes/lactantes' },
    { value: 'adultos-mayores', label: 'Adultos mayores' },
    { value: 'deportistas', label: 'Deportistas' },
    { value: 'dietas-especiales', label: 'Dietas especiales - condiciones médicas' }
  ];

  readonly processingTypes: OptionItem[] = [

    { value: 'horneado', label: 'Horneado' },
    { value: 'deshidratado', label: 'Deshidratado' },
    { value: 'relleno', label: 'Relleno' },
    { value: 'cubierto', label: 'Cubierto' },
    { value: 'vacio', label: 'Envasado al vacío' },
    { value: 'frito', label: 'Frito' },
    { value: 'congelado', label: 'Congelado' },
    { value: 'pasteurizado', label: 'Pasteurizado' },
    { value: 'refrigerado', label: 'Refrigerado' },
    { value: 'fermentado', label: 'Fermentado' },
    { value: 'polvo', label: 'En polvo' },
    { value: 'embutido', label: 'Embutido' },
    { value: 'cocido', label: 'Cocido' },
    { value: 'curado', label: 'Curado' },
    { value: 'precocido', label: 'Precocido congelado' },
    { value: 'envasado', label: 'Envasado' },
    { value: 'enlatado', label: 'Enlatado' },
    { value: 'esterilizado', label: 'Esterilizados' },
    { value: 'atmosfera', label: 'En atmósfera modificada' },
    { value: 'secado-natural', label: 'Secado natural' },

    { value: 'otro', label: 'Otro método' }
  ];

  readonly procedureTypes: OptionItem[] = [
    { value: 'registro-sanitario', label: 'Registro Sanitario' },
    { value: 'permiso-sanitario', label: 'Permiso Sanitario' },
    { value: 'notificacion-sanitaria', label: 'Notificación Sanitaria' }
  ];

  readonly procedureModes: OptionItem[] = [
    { value: 'ordinario', label: 'Ordinario (60 días hábiles)' },
    { value: 'urgente', label: 'Urgente (30 días hábiles)' }
  ];

  readonly shelfLifeUnits: OptionItem[] = [
    { value: 'days', label: 'Días' },
    { value: 'months', label: 'Meses' },
    { value: 'years', label: 'Años' }
  ];

  readonly departments: OptionItem[] = [
    { value: 'Cundinamarca', label: 'Cundinamarca' },
    { value: 'Antioquia', label: 'Antioquia' },
    { value: 'Valle del Cauca', label: 'Valle del Cauca' },
    { value: 'Atlántico', label: 'Atlántico' },
    { value: 'Santander', label: 'Santander' },
    { value: 'Bolívar', label: 'Bolívar' },
    { value: 'Norte de Santander', label: 'Norte de Santander' },
    { value: 'Córdoba', label: 'Córdoba' },
    { value: 'Tolima', label: 'Tolima' },
    { value: 'Huila', label: 'Huila' }
  ];

  readonly countries: OptionItem[] = [
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Estados Unidos', label: 'Estados Unidos' },
    { value: 'México', label: 'México' },
    { value: 'Brasil', label: 'Brasil' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'España', label: 'España' },
    { value: 'Francia', label: 'Francia' },
    { value: 'Italia', label: 'Italia' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Perú', label: 'Perú' }
  ];

  readonly completionSteps: CompletionStep[] = [
    { title: 'Clasificación', status: 'Completada' },
    { title: 'Formulario', status: 'Completado' },
    { title: 'Documentación', status: 'Verificada' }
  ];

  readonly nextSteps: NextStep[] = [
    {
      number: 1,
      title: 'Seguimiento del Trámite',
      description: 'Monitoree el estado de su solicitud a través de la plataforma INVIMA con el número de radicado que recibirá.'
    },
    {
      number: 2,
      title: 'Respuesta a Requerimientos',
      description: 'Atienda oportunamente cualquier solicitud de información adicional en un plazo máximo de 30 días hábiles.'
    },
    {
      number: 3,
      title: 'Resolución',
      description: 'Reciba la resolución de aprobación o negación del registro sanitario según el tipo de trámite solicitado.'
    }
  ];

  /**
   * Método para validar si una pestaña está bloqueada
   */
  isTabDisabled(tabId: string): boolean {
    switch(tabId) {
      case 'clasificacion':
        return false; // Siempre disponible
      case 'documentacion':
        return !this.clasificacionCompleta; // Solo si la clasificación está completa
      case 'radicacion':
        return !this.clasificacionCompleta || !this.todosDocumentosCompletos; // Solo si todo está completo
      default:
        return false;
    }
  }

  /**
   * Método para validar si una pestaña está completada
   */
  isTabCompleted(tabId: string): boolean {
    switch(tabId) {
      case 'clasificacion':
        return this.clasificacionCompleta;
      case 'documentacion':
        return this.todosDocumentosCompletos;
      case 'radicacion':
        return false; // La radicación no se marca como completa hasta que se radique
      default:
        return false;
    }
  }

  /**
   * Método para validar si el formulario de clasificación está válido
   */
  isClassificationFormValid(): boolean {
    return !!(
      this.productoSeleccionado &&
      this.classificationForm.productCategory &&
      this.classificationForm.riskLevel &&
      this.classificationForm.targetPopulation &&
      this.classificationForm.processingType
    );
  }

  /**
   * Método que se ejecuta cada vez que cambia un campo
   * Realiza validación automática
   */
  onFieldChange(): void {
    // Este método se puede usar para triggers adicionales si es necesario
    // Por ahora, Angular reactivamente actualizará las validaciones
  }

  setActiveTab(tab: string): void {
    // Solo permite cambiar si la pestaña no está bloqueada
    if (!this.isTabDisabled(tab)) {
      this.activeTab = tab;
    }

    if (tab === 'documentacion') {
      this.mostrarInfoProductoYClasificacion();
    }
  }

  mostrarInfoProductoYClasificacion(): void {
    console.log('📦 Información del producto seleccionado:');
    console.log(this.productoSeleccionado);

    console.log('🧾 Resultado de la clasificación:');
    console.log(this.resultadoClasificacion);
  }


  /**
   * Método que se ejecuta cada vez que cambia la población objetivo
   * Aplica REGLA 1: Población vulnerable → RSA automático
   */
  onPoblacionChange(): void {
    this.aplicarReglasDeNegocio();
  }

  /**
   * Método que se ejecuta cada vez que cambia el procesamiento
   * Aplica REGLA 2: Procesamiento alto riesgo → RSA automático
   */
  onProcesamientoChange(): void {
    this.aplicarReglasDeNegocio();
  }

  /**
   * Método que se ejecuta cada vez que cambia la categoría
   * Aplica REGLA 4: Lácteos/Cárnicos + Riesgo medio → RSA automático
   */
  onCategoriaChange(): void {
    this.aplicarReglasDeNegocio();
  }

  /**
   * Aplica todas las reglas de negocio INVIMA de forma automática
   * IMPLEMENTA TODAS LAS REGLAS DEL DOCUMENTO OFICIAL
   */
  private aplicarReglasDeNegocio(): void {
    const poblacion = this.classificationForm.targetPopulation?.toLowerCase() || '';
    const procesamiento = this.classificationForm.processingType?.toLowerCase() || '';
    const categoria = this.classificationForm.productCategory?.toLowerCase() || '';
    const riesgoActual = this.classificationForm.riskLevel;

    // 🧁 Panadería / Galletería / Confitería
    if (categoria.includes('panaderia') || categoria.includes('galleteria') || categoria.includes('confiteria')) {
      if (procesamiento.includes('horneado') || procesamiento.includes('deshidratado')) {

        this.classificationForm.riskLevel = "bajo";
      } else if (procesamiento.includes('relleno') || procesamiento.includes('cubierto') || procesamiento.includes('vacio')) {
        this.classificationForm.riskLevel = "medio";
      } else if (poblacion.includes('infantil') || poblacion.includes('sensible') || procesamiento.includes('fritos') || procesamiento.includes('congelados')) {
        this.classificationForm.riskLevel = "alto";
      }
    }

    // 🥛 Lácteos y derivados
    if (categoria.includes('lacteos')) {
      if (poblacion.includes('infantil') || poblacion.includes('gestante') || poblacion.includes('adulto mayor') ||
          procesamiento.includes('fermentado') || procesamiento.includes('polvo')) {
        this.classificationForm.riskLevel = "alto";
      } else if (procesamiento.includes('pasteurizado') || procesamiento.includes('refrigerado')) {
        this.classificationForm.riskLevel = "medio";
      }
    }

    // 🥩 Productos cárnicos procesados
    if (categoria.includes('carnicos')) {
      if (procesamiento.includes('listos-consumo') || procesamiento.includes('precocido') || procesamiento.includes('congelado')) {
        this.classificationForm.riskLevel = "alto";
      } else if (procesamiento.includes('cocido') || procesamiento.includes('curado') || procesamiento.includes('embutido')) {
        this.classificationForm.riskLevel = "medio";
      }
    }

    // 🍹 Jugos, néctares, bebidas
    if (categoria.includes('jugos') || categoria.includes('nectares') || categoria.includes('no-alcohólicas') || categoria.includes('infantiles')) {
      if (poblacion.includes('infantil')) {
        this.classificationForm.riskLevel = "alto";
      } else if (procesamiento.includes('pasteurizado') || procesamiento.includes('refrigerado')) {
        this.classificationForm.riskLevel = "medio";
      }
    }

    // 🥫 Conservas, salsas y aderezos
    if (categoria.includes('conservas') || categoria.includes('salsas')) {
      if (procesamiento.includes('enlatado') || procesamiento.includes('frasco')) {
        this.classificationForm.riskLevel = "medio";
      } else if (procesamiento.includes('esterilizado') || procesamiento.includes('atmósfera modificada')) {
        this.classificationForm.riskLevel = "alto";
      }
    }

    if (this.classificationForm.riskLevel == ''){
      this.classificationForm.riskLevel = "alto";
    }
  }


  /**
   * Valida que el riesgo seleccionado manualmente sea coherente con la categoría
   */
  private validarCoherenciaRiesgo(): void {
    const categoria = this.classificationForm.productCategory?.toLowerCase() || '';
    const riesgo = this.classificationForm.riskLevel;

    // Lácteos y cárnicos no pueden ser bajo riesgo
    const categoriasSensibles = ['lacteos', 'lácteos', 'carnicos', 'cárnicos'];
    if (categoriasSensibles.some(cat => categoria.includes(cat)) && riesgo === 'bajo') {
      this.classificationForm.riskLevel = 'medio';
      this.mensajeReglaActiva = '⚠️ ADVERTENCIA: Esta categoría no puede ser de riesgo bajo. Se ajustó a riesgo MEDIO.';
    }
  }

  onClasificarProducto(): void {
    if (!this.isClassificationFormValid()) {
      alert('Por favor complete todos los campos de clasificación.');
      return;
    }

    // Aplicar reglas de negocio antes de clasificar
    this.aplicarReglasDeNegocio();

    // Determinar automáticamente el tipo de trámite basado en el riesgo
    this.updateProcedureTypeBasedOnRisk();

    // Preparar los datos de clasificación para el servicio
    const clasificacion: ClasificacionProducto = {
      categoria: this.classificationForm.productCategory,
      nivel_riesgo: this.classificationForm.riskLevel as 'bajo' | 'medio' | 'alto',
      poblacion_objetivo: this.classificationForm.targetPopulation,
      procesamiento: this.classificationForm.processingType,
      tipo_accion: 'registro',
      es_importado: this.solicitudForm.isImported
    };

    // ✅ AHORA USA EL BACKEND - Obtener los documentos requeridos dinámicamente
    this.tramiteService.clasificarProducto(clasificacion, this.token).subscribe({
      next: (resultado) => {
        this.resultadoClasificacion = resultado;
        this.clasificacionCompleta = true;

        // Mostrar alerta con información detallada
        let mensajeDetalle = `Producto clasificado correctamente.\n\n`;
        mensajeDetalle += `Tipo de trámite: ${resultado.tramite}\n`;
        mensajeDetalle += `${resultado.tramite_descripcion}\n\n`;
        mensajeDetalle += `Se han determinado ${resultado.documentos.length} documentos requeridos.\n\n`;

        if (this.mensajeReglaActiva) {
          mensajeDetalle += `${this.mensajeReglaActiva}\n\n`;
        }

        mensajeDetalle += `Tiempo estimado: ${resultado.tiempo_estimado}\n`;
        mensajeDetalle += `Costo estimado: ${resultado.costo_estimado}`;

        alert(mensajeDetalle);
        this.setActiveTab('documentacion');
      },
      error: (error) => {
        console.error('❌ Error al clasificar producto:', error);
        console.error('❌ Status Code:', error.status);
        console.error('❌ Error Message:', error.message);
        console.error('❌ Error Details:', error.error);
        console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));

        let errorMessage = 'Error al obtener los documentos requeridos del servidor.';

        if (error.status === 0) {
          errorMessage += '\n\nNo se pudo conectar con el servidor. Verifique su conexión a internet.';
        } else if (error.status === 404) {
          errorMessage += '\n\nEndpoint no encontrado. Verifique que el backend esté corriendo.';
        } else if (error.status === 500) {
          errorMessage += '\n\nError interno del servidor.';
        } else if (error.error && error.error.message) {
          errorMessage += '\n\nDetalle: ' + error.error.message;
        }

        alert(errorMessage + '\n\nPor favor intente nuevamente.');
      }
    });
  }

  onDocumentoCompletado(evento: { documentoId: string; datos: any }): void {
    const { documentoId, datos } = evento;
    const nuevoDoc = { documentoId, archivo: datos.archivo };

    // Verificar si el documento ya existe
    const index = this.documentosCargados.findIndex(d => d.documentoId === documentoId);

    if (index !== -1) {
      // Si existe, reemplazar el documento
      this.documentosCargados[index] = nuevoDoc;
      console.log(`🔁 Documento "${documentoId}" actualizado.`);
    } else {
      // Si no existe, agregarlo a la lista
      this.documentosCargados.push(nuevoDoc);
      console.log(`✅ Documento "${documentoId}" agregado.`);
    }

    // Mostrar la lista completa
    console.log('📄 Lista actualizada de documentos:', this.documentosCargados);
  }

  onTodosDocumentosCompletos(completos: boolean): void {
    this.todosDocumentosCompletos = completos;
    console.log('Todos los documentos obligatorios completos:', completos);
  }

  onSaveFormulario(): void {
    if (!this.isSolicitudFormValid()) {
      alert('Por favor complete todos los campos obligatorios del formulario.');
      return;
    }

    console.log('Formulario guardado:', this.solicitudForm);
    alert('Formulario guardado correctamente. Puede continuar con la documentación técnica.');
    this.setActiveTab('documentacion');
  }

  onRadicarSolicitud(): void {
    this.authService.getUsuarioId().subscribe({
      next: (usuarioId) => {
        if (usuarioId !== null) {
          console.log("📨 ========== INICIANDO RADICACIÓN ==========");
          console.log("🆔 ID del producto:", this.productoSeleccionado.id);
          console.log("📦 Nombre del producto:", this.productoSeleccionado.nombre);
          console.log("📄 Tipo de trámite:", this.resultadoClasificacion?.tramite_descripcion);
          console.log("👤 ID del usuario:", usuarioId);

          const token = this.authService.getToken();
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          });

          const body = {
            productoId: this.productoSeleccionado.id,
            procedureType: this.resultadoClasificacion?.tramite_descripcion,
            radicadoNumber: '',
            usuarioId: usuarioId
          };

          const url = `${environment.apiUrl}/api/tramites/create`;

          this.http.post<TramiteResponse>(url, body, { headers }).subscribe({
            next: async (response: TramiteResponse) => {
              console.log('✅ Trámite creado exitosamente:', response);

              const tramiteId = response.id;
              const numeroRadicado = response.radicadoNumber || `TEMP-${tramiteId}`;

              // Obtener datos de la empresa y usuario para enviar carta formal
              console.log('📧 Preparando solicitud formal al INVIMA...');
              try {
                // Obtener datos de la empresa
                const empresa = await this.usuarioService.getEmpresaByUsuarioId(usuarioId, this.token).toPromise();
                const usuario = await this.usuarioService.getUsuarioById(usuarioId, this.token).toPromise();

                if (!empresa || !usuario) {
                  throw new Error('No se pudieron obtener los datos de la empresa o usuario');
                }

                // Preparar lista de documentos adjuntos
                const documentosAdjuntos = [
                  'Ficha técnica del producto',
                  'Certificado de Buenas Prácticas de Manufactura (BPM)',
                  'Resultados de análisis microbiológico y fisicoquímico',
                  'Análisis nutricional del producto',
                  'Etiqueta del producto conforme a la normativa vigente',
                  'Diagrama de flujo del proceso de producción',
                  'Plan HACCP (Análisis de Peligros y Puntos Críticos de Control)',
                  'Estudios de validación y estabilidad del producto',
                  'Manual de calidad',
                  'Certificado de calidad del proveedor',
                  'Ficha técnica de materias primas'
                ];

                // Preparar datos completos para la carta formal
                await this.emailService.enviarSolicitudFormalInvima({
                  numeroRadicado: numeroRadicado,
                  tipoTramite: this.resultadoClasificacion?.tramite_descripcion || 'Registro Sanitario de Alimentos',
                  empresa: {
                    razonSocial: empresa.razonSocial || empresa.nombreComercial || 'Empresa',
                    nit: empresa.nit || 'N/A',
                    direccion: empresa.direccion || 'Dirección no especificada',
                    ciudad: empresa.ciudad || 'Ciudad',
                    telefono: empresa.telefono || 'N/A',
                    email: empresa.email || 'correo@empresa.com'
                  },
                  representanteLegal: {
                    nombre: usuario.fullName || `${usuario.firstName} ${usuario.lastName}` || 'Representante Legal',
                    cedula: usuario.idNumber || 'N/A'
                  },
                  producto: {
                    nombre: this.productoSeleccionado.nombre || this.solicitudForm.productName,
                    marca: this.solicitudForm.brandName || 'N/A',
                    categoria: this.classificationForm.productCategory || 'Alimentos',
                    presentacion: this.solicitudForm.presentation || 'Presentación estándar'
                  },
                  fabricacion: {
                    nombrePlanta: this.solicitudForm.manufacturer.name || 'Planta de Producción',
                    direccionPlanta: this.solicitudForm.manufacturer.address || 'Dirección de planta',
                    ciudadPlanta: this.solicitudForm.manufacturer.city || 'Ciudad',
                    departamentoPlanta: this.solicitudForm.manufacturer.department || 'Departamento'
                  },
                  documentosAdjuntos: documentosAdjuntos,
                  alcanceComercializacion: 'Nacional'
                });

                console.log('✅ Solicitud formal enviada al INVIMA correctamente');
                alert('✅ Trámite radicado correctamente.\n📧 Se ha enviado la solicitud formal al INVIMA.');
              } catch (emailError) {
                console.warn('⚠️ El trámite se radicó pero hubo un problema al enviar la solicitud:', emailError);
                alert('✅ Trámite radicado correctamente.\n⚠️ Nota: No se pudo enviar la solicitud formal al INVIMA.');
              }

              // Navegar al paso 4
              this.router.navigate(['main/nuevo/registro/paso-2', tramiteId]);
            },
            error: (error) => {
              console.error('❌ Error al radicar el trámite:', error);
              alert('❌ Ocurrió un error al radicar el trámite.');
            }
          });
        } else {
          console.error('Usuario ID es null');
          alert('Error: No se pudo obtener el ID del usuario.');
        }
      },
      error: (err) => {
        console.error('Error al obtener usuario ID', err);
        alert('Error al obtener el ID del usuario.');
      }
    });

    const token = this.authService.getToken();

    for (const doc of this.documentosCargados) {
      console.log("📄 Documento a cargar:", doc.documentoId);

      this.documentService
        .cargarDocumento(doc.documentoId, doc.archivo, token!, this.productoSeleccionado)
        .subscribe({
          next: (res) => console.log(`📤 Documento ${doc.documentoId} cargado correctamente`),
          error: (err) => console.error(`❌ Error al subir documento ${doc.documentoId}:`, err),
          complete: () => console.log(`✅ Flujo completado para ${doc.documentoId}`)
        });
    }

  }


  isFormCompleteForRadication(): boolean {
    return this.isClassificationComplete() && this.isSolicitudFormValid();
  }

  getProcedureTypeLabel(value: string): string {
    return this.procedureTypes.find(item => item.value === value)?.label || 'Sin especificar';
  }

  getProductCategoryLabel(value: string): string {
    return this.productCategories.find(item => item.value === value)?.label || 'Sin especificar';
  }

  getRiskLevelLabel(value: string): string {
    return this.riskLevels.find(item => item.value === value)?.label || 'Sin especificar';
  }

  private isClassificationComplete(): boolean {
    return !!(
      this.classificationForm.productCategory &&
      this.classificationForm.riskLevel &&
      this.classificationForm.targetPopulation &&
      this.classificationForm.processingType
    );
  }

  private isSolicitudFormValid(): boolean {
    const form = this.solicitudForm;
    const basicFieldsValid = !!(
      form.productName?.trim() &&
      form.brandName?.trim() &&
      form.presentation?.trim() &&
      form.manufacturer.name?.trim() &&
      form.manufacturer.address?.trim() &&
      form.manufacturer.city?.trim() &&
      form.manufacturer.department &&
      form.ingredients?.trim() &&
      form.storageConditions?.trim() &&
      form.targetPopulationDescription?.trim() &&
      form.shelfLife > 0
    );

    // Validaciones adicionales para productos importados
    if (form.isImported) {
      return basicFieldsValid && !!(
        form.importer.name?.trim() &&
        form.manufacturer.country &&
        form.manufacturer.country !== 'Colombia'
      );
    }

    return basicFieldsValid;
  }

  private updateProcedureTypeBasedOnRisk(): void {
    switch (this.classificationForm.riskLevel) {
      case 'alto':
        this.solicitudForm.procedureType = 'registro-sanitario';
        break;
      case 'medio':
        this.solicitudForm.procedureType = 'permiso-sanitario';
        break;
      case 'bajo':
        this.solicitudForm.procedureType = 'notificacion-sanitaria';
        break;
    }
  }

  private generateRadicationNumber(): string {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 999999) + 1;
    return `${year}${randomNumber.toString().padStart(6, '0')}`;
  }

  // TrackBy functions para optimización
  trackByTab(index: number, tab: Tab): string {
    return tab.id;
  }

  trackByValue(index: number, item: OptionItem): string {
    return item.value;
  }

  trackByStep(index: number, step: CompletionStep): string {
    return step.title;
  }

  trackByNextStep(index: number, step: NextStep): string {
    return step.title;
  }
}
