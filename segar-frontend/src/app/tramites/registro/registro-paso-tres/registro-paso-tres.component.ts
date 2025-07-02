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

  // Ejemplo de modelo para el formulario de clasificación
  classificationForm = {
    productCategory: '',
    targetPopulation: '',
    processingType: '',
    healthClaims: ''
  };

  solicitudForm = {
    procedureType: '',
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
    alert('Formulario guardado (simulado)');
  }

  onVerifyDocumentacion() {
    alert('Verificación de documentación (simulada)');
  }

  onClasificarProducto() {
    alert('Clasificación realizada (simulada)');
  }
}
