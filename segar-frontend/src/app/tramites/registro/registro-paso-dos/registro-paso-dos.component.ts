import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Additive = {
  name: string;
  code: string;
  function: string;
};

@Component({
  standalone: true,
  selector: 'app-registro-paso-dos',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-dos.component.html',
  styleUrls: ['./registro-paso-dos.component.css']
})
export class RegistroPasoDosComponent {
  activeTab = 'registro';

  fileUploaded = false;
  uploading = false;
  uploadProgress = 0;
  success = false;
  alternativeVerification = false;

  // Formulario de registro simulado
  registroForm = {
    persona: 'Jurídica',
    tipoDocumento: 'NIT',
    numeroDocumento: '',
    razonSocial: '',
    correo: '',
    password: '',
    confirmPassword: ''
  };

  // Modelo de documento técnico
  dynamicDocument = {
    category: 'technical',
    type: 'ficha-tecnica',
    productName: '',
    brand: '',
    presentation: '',
    shelfLife: 0,
    description: '',
    ingredients: '',
    additives: [] as Additive[]
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addAdditive() {
    this.dynamicDocument.additives.push({ name: '', code: '', function: '' });
  }

  simulateUpload(file: File) {
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.simulateUpload(file);
    }
  }

  triggerAlternativeVerification() {
    this.alternativeVerification = true;
  }

  onSubmitRegistro() {
    console.log('Formulario enviado:', this.registroForm);
    alert('Registro simulado enviado');
  }
}
