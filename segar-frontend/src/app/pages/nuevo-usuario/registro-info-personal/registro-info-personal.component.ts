import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registro-info-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-info-personal.component.html',
  styleUrl: './registro-info-personal.component.css'
})
export class RegistroInfoPersonalComponent {
  @Input() form!: FormGroup;
  @Output() nextStep = new EventEmitter<void>();

  onNext() {
    if (this.form.valid) {
      this.nextStep.emit();
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
}
