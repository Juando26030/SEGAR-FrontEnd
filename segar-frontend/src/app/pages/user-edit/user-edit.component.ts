import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Activo' | 'Inactivo';
  createdDate: string;
  initials: string;
}

@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() userToEdit: User | null = null;
  @Input() isAdminMode = false; // Nuevo input para indicar si se está editando desde admin
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

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
    status: 'Activo' as 'Activo' | 'Inactivo',
    
    // Cambio de Contraseña (opcional)
    newPassword: '',
    confirmNewPassword: ''
  };

  // Permisos del usuario (solo visible para admin)
  permissions = {
    gestionUsuarios: true,
    accesoReportes: true,
    configuracionSistema: false
  };

  showNewPassword = false;
  showConfirmPassword = false;

  ngOnChanges() {
    if (this.userToEdit && this.isVisible) {
      this.loadUserData();
    }
  }

  private loadUserData() {
    if (this.userToEdit) {
      // Cargar datos básicos del usuario
      const [firstName, lastName] = this.userToEdit.name.split(' ');
      this.editForm = {
        ...this.editForm,
        firstName: firstName || '',
        lastName: lastName || '',
        email: this.userToEdit.email,
        confirmEmail: this.userToEdit.email,
        username: this.userToEdit.email.split('@')[0],
        role: this.userToEdit.role.toLowerCase(),
        status: this.userToEdit.status
      };
    }
  }

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

    // Crear usuario actualizado
    if (this.userToEdit) {
      const updatedUser: User = {
        ...this.userToEdit,
        name: `${this.editForm.firstName} ${this.editForm.lastName}`,
        email: this.editForm.email,
        role: this.editForm.role,
        status: this.editForm.status
      };
      
      this.userUpdated.emit(updatedUser);
    }

    // Aquí iría la lógica para guardar los cambios
    console.log('Guardando cambios:', this.editForm);
    if (this.isAdminMode) {
      console.log('Guardando permisos:', this.permissions);
    }
    
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
