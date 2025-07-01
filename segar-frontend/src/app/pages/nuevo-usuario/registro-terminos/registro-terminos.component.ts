import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registro-terminos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-terminos.component.html',
  styleUrl: './registro-terminos.component.css'
})
export class RegistroTerminosComponent {
  @Input() form!: FormGroup;
  @Input() summaryData: any;
  @Output() previousStep = new EventEmitter<void>();
  @Output() submitRegistration = new EventEmitter<void>();

  onPrevious() {
    this.previousStep.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitRegistration.emit();
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getRoleText(roleValue: string): string {
    switch(roleValue) {
      case 'admin': return 'Administrador';
      case 'quality': return 'Responsable de Calidad';
      case 'assistant': return 'Asistente de Documentación';
      default: return roleValue;
    }
  }
}
