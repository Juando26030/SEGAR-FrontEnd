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

  constructor(
    private tramiteService: TramiteInvimaService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private productoService: ProductoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
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
          this.usuarioService.getEmpresaByUsuarioId(usuarioId).subscribe({
            next: (empresa) => {
              const empresaId = empresa.id;
              this.productoService.getProductosSinTramites(empresaId).subscribe({
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
    { value: 'bebidas', label: 'Bebidas no alcohólicas' },
    { value: 'lacteos', label: '⚠️ Productos lácteos (Riesgo medio mínimo)' },
    { value: 'carnicos', label: '⚠️ Productos cárnicos (Riesgo medio mínimo)' },
    { value: 'panificacion', label: 'Productos de panificación (Riesgo bajo)' },
    { value: 'conservas', label: '🔴 Conservas alimenticias (Riesgo alto)' },
    { value: 'condimentos', label: 'Condimentos y especias' },
    { value: 'snacks', label: 'Snacks y productos de confitería' },
    { value: 'cereales', label: 'Cereales y derivados' },
    { value: 'aceites', label: 'Aceites y grasas (Riesgo medio)' },
    { value: 'infantiles', label: '🔴 Alimentos infantiles (Riesgo alto automático)' },
    { value: 'comidas-listas', label: '🔴 Comidas listas (Riesgo alto)' },
    { value: 'otros', label: 'Otros alimentos procesados' }
  ];

  readonly riskLevels: OptionItem[] = [
    { value: 'alto', label: 'Alto riesgo - Requiere Registro Sanitario (RSA)' },
    { value: 'medio', label: 'Medio riesgo - Requiere Permiso Sanitario (PSA)' },
    { value: 'bajo', label: 'Bajo riesgo - Requiere Notificación Sanitaria (NSO)' }
  ];

  readonly targetPopulations: OptionItem[] = [
    { value: 'general', label: 'Población general' },
    { value: 'infantil', label: '🔴 Alimentación infantil (bebés y niños) - ALTO RIESGO' },
    { value: 'gestantes', label: '🔴 Mujeres gestantes/lactantes - ALTO RIESGO' },
    { value: 'adultos mayores', label: '🔴 Adultos mayores - ALTO RIESGO' },
    { value: 'deportistas', label: '⚠️ Deportistas - MEDIO RIESGO mínimo' },
    { value: 'dietas especiales', label: '⚠️ Dietas especiales o médicas - MEDIO RIESGO mínimo' }
  ];

  readonly processingTypes: OptionItem[] = [
    // Riesgo ALTO (automático)
    { value: 'esterilizado', label: '🔴 Esterilizado comercialmente (ALTO RIESGO)' },
    { value: 'atmósfera modificada', label: '🔴 Atmósfera modificada (ALTO RIESGO)' },
    { value: 'congelado', label: '🔴 Congelado (ALTO RIESGO)' },
    { value: 'vacio', label: '🔴 Envasado al vacío con conservantes (ALTO RIESGO)' },
    { value: 'combinado', label: '🔴 Proceso combinado térmico (ALTO RIESGO)' },

    // Riesgo MEDIO
    { value: 'pasteurizado', label: '⚠️ Pasteurizado (MEDIO RIESGO)' },
    { value: 'refrigerado', label: '⚠️ Refrigerado (MEDIO RIESGO)' },
    { value: 'cocido', label: '⚠️ Cocido (MEDIO RIESGO)' },
    { value: 'fermentado', label: '⚠️ Fermentado (MEDIO RIESGO)' },

    // Riesgo BAJO
    { value: 'horneado', label: 'Horneado (Bajo riesgo)' },
    { value: 'deshidratado', label: 'Deshidratado (Bajo riesgo)' },
    { value: 'secado natural', label: 'Secado natural (Bajo riesgo)' },

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

    // ============================================
    // REGLA 1: POBLACIÓN VULNERABLE → ALTO (RSA) AUTOMÁTICO
    // ============================================
    const poblacionesVulnerables = [
      'infantil', 'bebés', 'bebes', 'niños', 'ninos',
      'gestantes', 'gestante', 'lactantes', 'lactante',
      'adultos mayores', 'adulto mayor', 'tercera-edad', 'especial'
    ];

    if (poblacionesVulnerables.some(pob => poblacion.includes(pob))) {
      this.classificationForm.riskLevel = 'alto';
      this.riskLevelDisabled = true;
      this.riskLevelForzado = 'alto';
      this.mensajeReglaActiva = '🔴 REGLA AUTOMÁTICA: Población vulnerable requiere Registro Sanitario (RSA) - Riesgo ALTO obligatorio [Res. 719/2015]';
      return;
    }

    // ============================================
    // REGLA ESPECIAL: DEPORTISTAS Y DIETAS ESPECIALES → MEDIO MÍNIMO
    // ============================================
    const poblacionesEspeciales = ['deportistas', 'deportista', 'dietas especiales', 'dieta especial', 'dietas médicas'];

    if (poblacionesEspeciales.some(pob => poblacion.includes(pob))) {
      // Si el riesgo es bajo, lo eleva a medio
      if (!riesgoActual || riesgoActual === 'bajo') {
        this.classificationForm.riskLevel = 'medio';
        this.riskLevelDisabled = true;
        this.mensajeReglaActiva = '⚠️ REGLA AUTOMÁTICA: Población especial requiere mínimo Permiso Sanitario (PSA) - Riesgo MEDIO mínimo';
        return;
      }
    }

    // ============================================
    // REGLA 2: CATEGORÍAS DE ALTO RIESGO AUTOMÁTICO
    // ============================================
    const categoriasAltoRiesgo = [
      'infantiles', 'alimentos infantiles', 'formula infantil',
      'conservas', 'comidas listas', 'comidas-listas',
      'esterilizados', 'productos esterilizados'
    ];

    if (categoriasAltoRiesgo.some(cat => categoria.includes(cat))) {
      this.classificationForm.riskLevel = 'alto';
      this.riskLevelDisabled = true;
      this.riskLevelForzado = 'alto';
      this.mensajeReglaActiva = '🔴 REGLA AUTOMÁTICA: Esta categoría requiere Registro Sanitario (RSA) - Riesgo ALTO por complejidad sanitaria';
      return;
    }

    // ============================================
    // REGLA 3: PROCESAMIENTO DE ALTO RIESGO → ALTO AUTOMÁTICO
    // ============================================
    const procesamientosAltoRiesgo = [
      'esterilizado', 'esterilización', 'esterilizacion',
      'atmósfera modificada', 'atmosfera modificada', 'map',
      'congelado', 'congelación', 'congelacion', 'ultra congelado', 'ultracongelado',
      'vacio', 'vacío', 'al vacio', 'al vacío',
      'combinado', 'proceso combinado', 'térmico combinado'
    ];

    if (procesamientosAltoRiesgo.some(proc => procesamiento.includes(proc))) {
      this.classificationForm.riskLevel = 'alto';
      this.riskLevelDisabled = true;
      this.riskLevelForzado = 'alto';
      this.mensajeReglaActiva = '🔴 REGLA AUTOMÁTICA: Procesamiento de alto riesgo requiere Registro Sanitario (RSA) - Riesgo ALTO obligatorio';
      return;
    }

    // ============================================
    // REGLA 4: PROCESAMIENTOS DE RIESGO MEDIO → MEDIO MÍNIMO
    // ============================================
    const procesamientosMedioRiesgo = [
      'pasteurizado', 'pasteurización',
      'refrigerado', 'refrigeración',
      'cocido', 'cocción',
      'fermentado', 'fermentación'
    ];

    if (procesamientosMedioRiesgo.some(proc => procesamiento.includes(proc))) {
      // Si el riesgo es bajo, lo eleva a medio
      if (!riesgoActual || riesgoActual === 'bajo') {
        this.classificationForm.riskLevel = 'medio';
        this.riskLevelDisabled = true;
        this.mensajeReglaActiva = '⚠️ REGLA AUTOMÁTICA: Este procesamiento requiere mínimo Permiso Sanitario (PSA) - Riesgo MEDIO mínimo';
        return;
      }
    }

    // ============================================
    // REGLA 5: CATEGORÍAS CON RIESGO MEDIO MÍNIMO
    // ============================================
    const categoriasMedioRiesgo = [
      'lacteos', 'lácteos', 'derivados lácteos', 'derivados lacteos',
      'carnicos', 'cárnicos', 'productos cárnicos', 'productos carnicos',
      'aceites', 'grasas', 'aceites y grasas'
    ];

    const esCategoriaMediaRiesgo = categoriasMedioRiesgo.some(cat => categoria.includes(cat));

    if (esCategoriaMediaRiesgo) {
      // No pueden ser de riesgo bajo
      if (riesgoActual === 'bajo') {
        this.classificationForm.riskLevel = 'medio';
        this.riskLevelDisabled = true;
        this.mensajeReglaActiva = '⚠️ REGLA AUTOMÁTICA: Esta categoría NO puede ser de riesgo bajo - Riesgo MEDIO mínimo obligatorio';
        return;
      }

      // Si es riesgo medio, se eleva a alto
      if (riesgoActual === 'medio') {
        this.classificationForm.riskLevel = 'alto';
        this.riskLevelDisabled = true;
        this.mensajeReglaActiva = '🔴 REGLA AUTOMÁTICA: Lácteos/Cárnicos con riesgo medio se elevan a Registro Sanitario (RSA) - Riesgo ALTO';
        return;
      }
    }

    // ============================================
    // REGLA 6: CATEGORÍAS DE RIESGO BAJO PREDEFINIDO
    // ============================================
    const categoriasRiesgoBajo = [
      'panificacion', 'panificación', 'panadería', 'panaderia',
      'galletería', 'galleteria', 'confitería', 'confiteria'
    ];

    if (categoriasRiesgoBajo.some(cat => categoria.includes(cat))) {
      // Solo si no hay otras reglas que lo eleven
      if (!riesgoActual && poblacion === 'general' &&
          (procesamiento === 'horneado' || procesamiento === 'deshidratado' || procesamiento === 'secado natural')) {
        this.classificationForm.riskLevel = 'bajo';
        this.riskLevelDisabled = false;
        this.mensajeReglaActiva = '';
        return;
      }
    }

    // ============================================
    // SI NO APLICA NINGUNA REGLA AUTOMÁTICA
    // ============================================
    this.riskLevelDisabled = false;
    this.riskLevelForzado = '';
    this.mensajeReglaActiva = '';

    // Pero validar coherencia si ya hay un valor seleccionado
    if (riesgoActual) {
      this.validarCoherenciaRiesgo();
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
    this.tramiteService.clasificarProducto(clasificacion).subscribe({
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
    console.log('Documento completado:', evento);
    // Aquí se podría guardar en el backend o en el estado local
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
          console.log("📨 AQUI SE RADICA LA SOLICITUD");
          console.log("🆔 ID del producto:", this.productoSeleccionado.id);
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
            next: (response: TramiteResponse) => {
              console.log('✅ Trámite creado exitosamente:', response);
              alert('✅ Trámite radicado correctamente.');
              const tramiteId = response.id;
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
