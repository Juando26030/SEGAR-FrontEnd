import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFieldDefinition, FieldOption } from '../../../core/DTOs/document-template.dto';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicFieldComponent),
      multi: true
    }
  ]
})
export class DynamicFieldComponent implements OnInit, ControlValueAccessor {
  @Input() field!: DocumentFieldDefinition;
  @Input() formControl!: FormControl;
  @Input() tramiteId!: number;
  @Input() instanceId?: number;

  value: any = '';
  disabled = false;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {}

  ngOnInit(): void {
    this.initializeValue();
  }

  private initializeValue(): void {
    switch (this.field.type) {
      case 'checkbox':
        this.value = false;
        break;
      case 'multiselect':
        this.value = [];
        break;
      case 'number':
        this.value = null;
        break;
      default:
        this.value = '';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Event handlers
  onValueChange(newValue: any): void {
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onValueChange(target.checked);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onValueChange(target.value);
  }

  onNumberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = target.value ? +target.value : null;
    this.onValueChange(numValue);
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onValueChange(target.value);
  }

  // Utility methods
  getFieldId(): string {
    return `field-${this.field.key}`;
  }

  isRequired(): boolean {
    return this.field.required || false;
  }

  getPlaceholder(): string {
    return this.field.placeholder || '';
  }

  getCharacterCount(): number {
    return typeof this.value === 'string' ? this.value.length : 0;
  }

  hasMaxLength(): boolean {
    return !!this.field.maxLength;
  }

  getMaxLength(): number {
    return this.field.maxLength || 0;
  }

  showCharacterCount(): boolean {
    return (this.field.type === 'text' || this.field.type === 'textarea') && this.hasMaxLength();
  }

  isOptionSelected(optionValue: string): boolean {
    if (!Array.isArray(this.value)) return false;
    return this.value.includes(optionValue);
  }

  getFieldLabel(): string {
    return this.field.label + (this.field.required ? ' *' : '');
  }

  hasError(): boolean {
    return this.formControl?.invalid && (this.formControl?.dirty || this.formControl?.touched);
  }

  getErrorMessage(): string {
    if (!this.formControl?.errors) return '';

    const errors = this.formControl.errors;

    if (errors['required']) {
      return `${this.field.label} es obligatorio`;
    }
    if (errors['email']) {
      return 'Ingresa un email válido';
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      return 'Formato inválido';
    }
    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    }

    return 'Campo inválido';
  }

  isCharacterCountWarning(): boolean {
    if (!this.field.maxLength) return false;
    const count = this.getCharacterCount();
    return count > this.field.maxLength * 0.8;
  }

  isCharacterCountError(): boolean {
    if (!this.field.maxLength) return false;
    const count = this.getCharacterCount();
    return count >= this.field.maxLength;
  }

  // Hacer onTouched público para que el template pueda accederlo
  public triggerTouched(): void {
    this.onTouched();
  }

  // Método faltante para multi-select
  onMultiSelectChange(optionValue: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentValue = Array.isArray(this.value) ? [...this.value] : [];

    if (target.checked) {
      if (!currentValue.includes(optionValue)) {
        currentValue.push(optionValue);
      }
    } else {
      const index = currentValue.indexOf(optionValue);
      if (index > -1) {
        currentValue.splice(index, 1);
      }
    }

    this.onValueChange(currentValue);
  }
}
