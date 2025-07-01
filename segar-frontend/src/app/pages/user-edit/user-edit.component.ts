import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  editForm = {
    // Información Personal
    firstName: 'Juan',
    lastName: 'Díaz',
    idType: 'dni',
    idNumber: '12345678',
    birthDate: '1990-01-15',
    gender: 'male',
    
    // Información de Contacto
    email: 'juan.diaz@tramitespro.com',
    confirmEmail: 'juan.diaz@tramitespro.com',
    phone: '+1 (555) 123-4567',
    altPhone: '+1 (555) 987-6543',
    address: 'Calle Principal 123',
    city: 'Ciudad Principal',
    postalCode: '12345',
    
    // Información de la Cuenta
    username: 'juan.diaz',
    role: 'admin',
    
    // Cambio de Contraseña (opcional)
    newPassword: '',
    confirmNewPassword: ''
  };

  showNewPassword = false;
  showConfirmPassword = false;

  closeModal() {
    this.close.emit();
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get emailsMatch(): boolean {
    return this.editForm.email === this.editForm.confirmEmail;
  }

  get passwordsMatch(): boolean {
    return this.editForm.newPassword === this.editForm.confirmNewPassword;
  }

  getPasswordStrength(): { score: number; text: string; color: string } {
    const password = this.editForm.newPassword || '';
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[!@#$%^&*]/.test(password)) score += 25;
    
    if (score < 50) return { score, text: 'Débil', color: 'bg-red-500' };
    if (score < 100) return { score, text: 'Moderada', color: 'bg-yellow-500' };
    return { score, text: 'Fuerte', color: 'bg-green-500' };
  }

  onSubmit() {
    // Validar que los emails coincidan
    if (!this.emailsMatch) {
      alert('Los correos electrónicos no coinciden');
      return;
    }

    // Validar contraseñas si se está cambiando
    if (this.editForm.newPassword || this.editForm.confirmNewPassword) {
      if (!this.passwordsMatch) {
        alert('Las nuevas contraseñas no coinciden');
        return;
      }
    }

    // Aquí iría la lógica para guardar los cambios
    console.log('Guardando cambios:', this.editForm);
    
    // Simulate API call success
    this.showSuccessNotification();
    this.closeModal();
  }

  private showSuccessNotification() {
    // Create success notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Perfil actualizado exitosamente</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
