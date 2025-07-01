import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registro-info-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-info-contacto.component.html',
  styleUrl: './registro-info-contacto.component.css'
})
export class RegistroInfoContactoComponent {
  @Input() form!: FormGroup;
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();

  onNext() {
    if (this.form.valid && this.validateEmailMatch()) {
      this.nextStep.emit();
    } else {
      this.markFormGroupTouched();
    }
  }

  onPrevious() {
    this.previousStep.emit();
  }

  private validateEmailMatch(): boolean {
    const email = this.form.get('email')?.value;
    const confirmEmail = this.form.get('confirmEmail')?.value;
    return email === confirmEmail;
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  get emailsMatch(): boolean {
    const email = this.form.get('email')?.value;
    const confirmEmail = this.form.get('confirmEmail')?.value;
    return email === confirmEmail || !confirmEmail;
  }
}
