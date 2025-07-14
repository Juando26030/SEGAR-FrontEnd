import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OptionItem {
  value: string;
  label: string;
}

interface Tab {
  id: string;
  label: string;
}

interface DocumentCategory {
  title: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  acceptedTypes: string;
  required?: boolean;
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

@Component({
  standalone: true,
  selector: 'app-registro-paso-tres',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-tres.component.html',
  styleUrls: ['./registro-paso-tres.component.css']
})
export class RegistroPasoTresComponent {
  activeTab = 'clasificacion';

  readonly tabs: Tab[] = [
    { id: 'clasificacion', label: 'Clasificación del Producto' },
    { id: 'solicitud', label: 'Formulario de Solicitud' },
    { id: 'documentacion', label: 'Documentación Técnica' },
    { id: 'radicacion', label: 'Radicación' }
  ];

  classificationForm: ClassificationForm = {
    productCategory: '',
    riskLevel: '',
    targetPopulation: '',
    processingType: ''
  };

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
    { value: 'lacteos', label: 'Productos lácteos' },
    { value: 'carnicos', label: 'Productos cárnicos' },
    { value: 'panificacion', label: 'Productos de panificación' },
    { value: 'conservas', label: 'Conservas alimenticias' },
    { value: 'condimentos', label: 'Condimentos y especias' },
    { value: 'snacks', label: 'Snacks y productos de confitería' },
    { value: 'cereales', label: 'Cereales y derivados' },
    { value: 'aceites', label: 'Aceites y grasas' },
    { value: 'otros', label: 'Otros alimentos procesados' }
  ];

  readonly riskLevels: OptionItem[] = [
    { value: 'alto', label: 'Alto riesgo - Requiere Registro Sanitario' },
    { value: 'medio', label: 'Medio riesgo - Requiere Permiso Sanitario' },
    { value: 'bajo', label: 'Bajo riesgo - Requiere Notificación Sanitaria' }
  ];

  readonly targetPopulations: OptionItem[] = [
    { value: 'general', label: 'Población general' },
    { value: 'infantil', label: 'Alimentación infantil' },
    { value: 'deportistas', label: 'Nutrición deportiva' },
    { value: 'tercera-edad', label: 'Tercera edad' },
    { value: 'especial', label: 'Población con necesidades especiales' }
  ];

  readonly processingTypes: OptionItem[] = [
    { value: 'esterilizado', label: 'Esterilizado comercialmente' },
    { value: 'pasteurizado', label: 'Pasteurizado' },
    { value: 'refrigerado', label: 'Refrigerado' },
    { value: 'congelado', label: 'Congelado' },
    { value: 'deshidratado', label: 'Deshidratado' },
    { value: 'fermentado', label: 'Fermentado' },
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

  readonly documentCategories: DocumentCategory[] = [
    {
      title: 'Documentos Legales',
      documents: [
        { id: 'cert-existencia', name: 'Certificado de Existencia y Representación Legal', acceptedTypes: '.pdf', required: true },
        { id: 'poder', name: 'Poder (si aplica)', acceptedTypes: '.pdf' },
        { id: 'cert-venta-libre', name: 'Certificado de Venta Libre', acceptedTypes: '.pdf' }
      ]
    },
    {
      title: 'Documentos Técnicos',
      documents: [
        { id: 'ficha-tecnica', name: 'Ficha Técnica del Producto', acceptedTypes: '.pdf,.doc,.docx', required: true },
        { id: 'composicion', name: 'Composición Cuali-Cuantitativa', acceptedTypes: '.pdf,.doc,.docx', required: true },
        { id: 'proceso-fabricacion', name: 'Proceso de Fabricación', acceptedTypes: '.pdf,.doc,.docx', required: true }
      ]
    },
    {
      title: 'Análisis de Laboratorio',
      documents: [
        { id: 'analisis-fisicoquimico', name: 'Análisis Fisicoquímico', acceptedTypes: '.pdf', required: true },
        { id: 'analisis-microbiologico', name: 'Análisis Microbiológico', acceptedTypes: '.pdf', required: true },
        { id: 'info-nutricional', name: 'Información Nutricional', acceptedTypes: '.pdf,.doc,.docx', required: true }
      ]
    },
    {
      title: 'Etiquetado',
      documents: [
        { id: 'artes-finales', name: 'Artes Finales de Etiquetas', acceptedTypes: '.pdf,.jpg,.png', required: true },
        { id: 'tabla-nutricional', name: 'Tabla Nutricional', acceptedTypes: '.pdf,.jpg,.png', required: true }
      ]
    }
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onClasificarProducto(): void {
    if (!this.isClassificationComplete()) {
      alert('Por favor complete todos los campos de clasificación.');
      return;
    }

    // Determinar automáticamente el tipo de trámite basado en el riesgo
    this.updateProcedureTypeBasedOnRisk();

    alert('Producto clasificado correctamente. El tipo de trámite ha sido determinado automáticamente.');
    this.setActiveTab('solicitud');
  }

  onSaveFormulario(): void {
    if (!this.isSolicitudFormValid()) {
      alert('Por favor complete todos los campos obligatorios del formulario.');
      return;
    }

    console.log('Formulario guardado:', this.solicitudForm);
    alert('Formulario guardado correctamente. Puede continuar con la documentación técnica.');
  }

  onVerifyDocumentacion(): void {
    alert('Documentación verificada correctamente. Todos los archivos han sido validados.');
  }

  onRadicarSolicitud(): void {
    if (!this.isFormCompleteForRadication()) {
      alert('Por favor complete toda la información requerida antes de radicar la solicitud.');
      return;
    }

    const numeroRadicado = this.generateRadicationNumber();

    alert(`¡Solicitud radicada exitosamente!\n\nNúmero de radicado: ${numeroRadicado}\n\nRecibirá una confirmación por correo electrónico con los detalles del trámite y las instrucciones para el seguimiento.`);

    console.log('Solicitud radicada:', {
      numeroRadicado,
      clasificacion: this.classificationForm,
      solicitud: this.solicitudForm,
      fechaRadicacion: new Date()
    });
  }

  onFileSelected(event: Event, documentId: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      alert('Tipo de archivo no permitido. Solo se aceptan archivos PDF, DOC, DOCX, JPG y PNG');
      target.value = '';
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 10MB');
      target.value = '';
      return;
    }

    console.log(`Archivo seleccionado para ${documentId}:`, file.name);
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

  trackByDocCategory(index: number, category: DocumentCategory): string {
    return category.title;
  }

  trackByDocument(index: number, document: Document): string {
    return document.id;
  }

  trackByStep(index: number, step: CompletionStep): string {
    return step.title;
  }

  trackByNextStep(index: number, step: NextStep): string {
    return step.title;
  }
}
