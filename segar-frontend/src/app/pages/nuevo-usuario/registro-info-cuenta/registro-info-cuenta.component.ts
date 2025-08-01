import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registro-info-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-info-cuenta.component.html',
  styleUrl: './registro-info-cuenta.component.css'
})
export class RegistroInfoCuentaComponent {
  @Input() form!: FormGroup;
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();

  showPassword = false;
  showConfirmPassword = false;

  onNext() {
    console.log('Account form valid:', this.form.valid);
    console.log('Account form values:', this.form.value);
    console.log('Password match:', this.validatePasswordMatch());
    console.log('Password strength:', this.validatePasswordStrength());
    console.log('Form errors:', this.form.errors);
    
    // Log individual field errors
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.errors) {
        console.log(`${key} errors:`, control.errors);
      }
    });
    
    if (this.form.valid && this.validatePasswordMatch() && this.validatePasswordStrength()) {
      this.nextStep.emit();
    } else {
      console.log('Form validation failed, marking fields as touched');
      this.markFormGroupTouched();
      
      // Show specific error messages
      if (!this.validatePasswordMatch()) {
        alert('Las contraseñas no coinciden');
      } else if (!this.validatePasswordStrength()) {
        alert('La contraseña no cumple con los requisitos de seguridad');
      } else if (this.form.invalid) {
        alert('Por favor complete todos los campos obligatorios');
      }
    }
  }

  onPrevious() {
    this.previousStep.emit();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private validatePasswordMatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  private validatePasswordStrength(): boolean {
    const password = this.form.get('password')?.value;
    if (!password) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasUpperCase && hasNumber && hasSpecial && isLongEnough;
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  get passwordsMatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password === confirmPassword || !confirmPassword;
  }

  getPasswordStrength(): { score: number; text: string; color: string } {
    const password = this.form.get('password')?.value || '';
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[!@#$%^&*]/.test(password)) score += 25;
    
    if (score < 50) return { score, text: 'Débil', color: 'bg-red-500' };
    if (score < 100) return { score, text: 'Moderada', color: 'bg-yellow-500' };
    return { score, text: 'Fuerte', color: 'bg-green-500' };
  }
}
