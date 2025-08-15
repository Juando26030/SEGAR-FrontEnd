import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface RegistroForm {
  persona: 'Jurídica' | 'Natural';
  tipoDocumento: 'NIT' | 'Cédula de Ciudadanía';
  numeroDocumento: string;
  razonSocial: string;
  correo: string;
  password: string;
  confirmPassword: string;
}

interface Additive {
  name: string;
  code: string;
  function: string;
}

interface DynamicDocument {
  category: string;
  type: string;
  productName: string;
  brand: string;
  presentation: string;
  shelfLife: number;
  description: string;
  ingredients: string;
  additives: Additive[];
}

@Component({
  standalone: true,
  selector: 'app-registro-paso-dos',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-paso-dos.component.html',
  styleUrls: ['./registro-paso-dos.component.css']
})
export class RegistroPasoDosComponent implements OnInit {
  activeTab = 'registro';
  uploading = false;
  uploadProgress = 0;
  success = false;
  alternativeVerification = false;

  registroForm: RegistroForm = {
    persona: 'Jurídica',
    tipoDocumento: 'NIT',
    numeroDocumento: '',
    razonSocial: '',
    correo: '',
    password: '',
    confirmPassword: ''
  };

  dynamicDocument: DynamicDocument = {
    category: 'technical',
    type: 'ficha-tecnica',
    productName: '',
    brand: '',
    presentation: '',
    shelfLife: 0,
    description: '',
    ingredients: '',
    additives: []
  };

  readonly tarifas = [
    {
      codigo: '4002-1',
      descripcion: 'Registro Sanitario de Alimentos de Riesgo Alto',
      valor: '$4,850,000'
    },
    {
      codigo: '4002-2',
      descripcion: 'Registro Sanitario de Alimentos de Riesgo Medio',
      valor: '$3,750,000'
    },
    {
      codigo: '4002-3',
      descripcion: 'Notificación Sanitaria de Alimentos de Bajo Riesgo',
      valor: '$2,650,000'
    },
    {
      codigo: '4002-4',
      descripcion: 'Renovación de Registro Sanitario',
      valor: '$3,950,000'
    },
    {
      codigo: '4002-5',
      descripcion: 'Modificación de Registro Sanitario',
      valor: '$2,350,000'
    }
  ];

  ngOnInit(): void {
    // Inicialización del componente si es necesaria
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  addAdditive(): void {
    this.dynamicDocument.additives.push({
      name: '',
      code: '',
      function: ''
    });
  }

  removeAdditive(index: number): void {
    if (index > -1 && index < this.dynamicDocument.additives.length) {
      this.dynamicDocument.additives.splice(index, 1);
    }
  }

  private simulateUpload(file: File): void {
    if (!file) return;

    this.uploading = true;
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 5;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploading = false;
        this.success = true;
      }
    }, 150);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG o PNG');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no puede ser mayor a 5MB');
        return;
      }

      this.simulateUpload(file);
    }
  }

  triggerAlternativeVerification(): void {
    this.alternativeVerification = true;
  }

  onSubmitRegistro(): void {
    if (!this.validateRegistroForm()) {
      return;
    }

    console.log('Formulario enviado:', this.registroForm);
    alert('Registro simulado enviado correctamente');
  }

  private validateRegistroForm(): boolean {
    const { numeroDocumento, razonSocial, correo, password, confirmPassword } = this.registroForm;

    if (!numeroDocumento.trim()) {
      alert('El número de documento es requerido');
      return false;
    }

    if (!razonSocial.trim()) {
      alert('La razón social es requerida');
      return false;
    }

    if (!correo.trim() || !this.isValidEmail(correo)) {
      alert('Por favor ingrese un correo electrónico válido');
      return false;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSaveDocument(): void {
    if (!this.validateDocument()) {
      return;
    }

    console.log('Documento guardado:', this.dynamicDocument);
    alert('Ficha técnica guardada correctamente');
  }

  private validateDocument(): boolean {
    const { productName, brand, presentation, description } = this.dynamicDocument;

    if (!productName.trim()) {
      alert('El nombre del producto es requerido');
      return false;
    }

    if (!brand.trim()) {
      alert('La marca comercial es requerida');
      return false;
    }

    if (!presentation.trim()) {
      alert('La presentación comercial es requerida');
      return false;
    }

    if (!description.trim()) {
      alert('La descripción del producto es requerida');
      return false;
    }

    return true;
  }

  // TrackBy functions para optimización
  trackByTarifa(index: number, tarifa: any): string {
    return tarifa.codigo;
  }

  trackByAdditive(index: number, additive: Additive): number {
    return index;
  }
}
