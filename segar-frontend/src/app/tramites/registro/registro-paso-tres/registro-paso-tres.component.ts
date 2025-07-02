import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-registro-paso-tres',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-tres.component.html',
  styleUrls: ['./registro-paso-tres.component.css']
})
export class RegistroPasoTresComponent {
  activeTab = 'clasificacion';

  // Modelo para el formulario de clasificación
  classificationForm = {
    productCategory: '',
    riskLevel: '',
    targetPopulation: '',
    processingType: ''
  };

  solicitudForm = {
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
    shelfLife: '',
    shelfLifeUnit: 'months',
    storageConditions: '',
    targetPopulationDescription: '',
    hasHealthClaims: false,
    healthClaimsDescription: ''
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onSaveFormulario() {
    console.log('Formulario guardado:', this.solicitudForm);
    alert('Formulario guardado correctamente. Puede continuar con la documentación técnica.');
  }

  onVerifyDocumentacion() {
    alert('Documentación verificada correctamente. Todos los archivos han sido validados.');
  }

  onClasificarProducto() {
    if (!this.classificationForm.productCategory || !this.classificationForm.riskLevel) {
      alert('Por favor complete todos los campos de clasificación.');
      return;
    }

    // Determinar automáticamente el tipo de trámite basado en el riesgo
    switch(this.classificationForm.riskLevel) {
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

    alert('Producto clasificado correctamente. El tipo de trámite ha sido determinado automáticamente.');
    this.setActiveTab('solicitud');
  }

  onRadicarSolicitud() {
    // Validar que todos los campos obligatorios estén completos
    if (!this.solicitudForm.productName || !this.solicitudForm.brandName ||
      !this.solicitudForm.manufacturer.name || !this.classificationForm.productCategory) {
      alert('Por favor complete toda la información requerida antes de radicar la solicitud.');
      return;
    }

    // Simular radicación
    const numeroRadicado = this.generateRadicationNumber();

    alert(`¡Solicitud radicada exitosamente!\n\nNúmero de radicado: ${numeroRadicado}\n\nRecibirá una confirmación por correo electrónico con los detalles del trámite y las instrucciones para el seguimiento.`);

    console.log('Solicitud radicada:', {
      numeroRadicado,
      clasificacion: this.classificationForm,
      solicitud: this.solicitudForm,
      fechaRadicacion: new Date()
    });
  }

  private generateRadicationNumber(): string {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 999999) + 1;
    return `${year}${randomNumber.toString().padStart(6, '0')}`;
  }
}
