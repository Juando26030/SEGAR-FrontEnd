import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroInfoPersonalComponent } from '../registro-info-personal/registro-info-personal.component';
import { RegistroInfoContactoComponent } from '../registro-info-contacto/registro-info-contacto.component';
import { RegistroInfoCuentaComponent } from '../registro-info-cuenta/registro-info-cuenta.component';
import { RegistroTerminosComponent } from '../registro-terminos/registro-terminos.component';

@Component({
  selector: 'app-pagina-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegistroInfoPersonalComponent,
    RegistroInfoContactoComponent,
    RegistroInfoCuentaComponent,
    RegistroTerminosComponent
  ],
  templateUrl: './pagina-registro.component.html',
  styleUrl: './pagina-registro.component.css'
})
export class PaginaRegistroComponent {
  currentStep = 1;
  totalSteps = 4;

  // Forms para cada step
  personalForm!: FormGroup;
  contactForm!: FormGroup;
  accountForm!: FormGroup;
  termsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      idType: ['', [Validators.required]],
      idNumber: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      gender: ['']
    });

    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      altPhone: [''],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['']
    });

    this.accountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.termsForm = this.fb.group({
      termsAccepted: [false, [Validators.requiredTrue]],
      marketingConsent: [false]
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  getStepClass(step: number): string {
    if (step < this.currentStep) return 'step-completed';
    if (step === this.currentStep) return 'step-active';
    return 'step-inactive';
  }

  isStepCompleted(step: number): boolean {
    switch (step) {
      case 1:
        return this.personalForm.valid;
      case 2:
        return this.contactForm.valid;
      case 3:
        return this.accountForm.valid;
      case 4:
        return this.termsForm.valid;
      default:
        return false;
    }
  }

  onSubmitRegistration() {
    if (this.allFormsValid()) {
      // Aquí iría la lógica para enviar el registro
      console.log('Registro completo:', {
        personal: this.personalForm.value,
        contact: this.contactForm.value,
        account: this.accountForm.value,
        terms: this.termsForm.value
      });
      
      // Simular registro exitoso
      alert('Registro exitoso! Redirigiendo al login...');
      this.router.navigate(['/auth/login']);
    }
  }

  private allFormsValid(): boolean {
    return this.personalForm.valid && 
           this.contactForm.valid && 
           this.accountForm.valid && 
           this.termsForm.valid;
  }

  getSummaryData() {
    return {
      name: `${this.personalForm.get('firstName')?.value || ''} ${this.personalForm.get('lastName')?.value || ''}`,
      document: `${this.personalForm.get('idType')?.value || ''}: ${this.personalForm.get('idNumber')?.value || ''}`,
      email: this.contactForm.get('email')?.value || '',
      phone: this.contactForm.get('phone')?.value || '',
      address: `${this.contactForm.get('address')?.value || ''}, ${this.contactForm.get('city')?.value || ''}`,
      username: this.accountForm.get('username')?.value || '',
      role: this.accountForm.get('role')?.value || ''
    };
  }
}
