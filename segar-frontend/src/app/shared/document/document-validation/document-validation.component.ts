import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTemplateDto } from '../../../core/DTOs/document-template.dto';
import { DocumentInstanceDto, ValidationError } from '../../../core/DTOs/document-instance.dto';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-validation',
  templateUrl: './document-validation.component.html',
  styleUrls: ['./document-validation.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DocumentValidationComponent implements OnInit, OnChanges {
  @Input() template!: DocumentTemplateDto;
  @Input() documentInstance!: DocumentInstanceDto;
  @Input() filledData: Record<string, any> = {};
  @Input() showSummary = true;
  @Input() showDetails = true;

  validationErrors: ValidationError[] = [];
  validationWarnings: ValidationError[] = [];
  isValid = false;
  completionPercentage = 0;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.validateDocument();
  }

  ngOnChanges(): void {
    this.validateDocument();
  }

  private validateDocument(): void {
    if (!this.template || !this.filledData) {
      return;
    }

    // Realizar validaciones usando el servicio
    const allErrors = this.documentService.validateDocumentData(this.template, this.filledData);

    // Separar errores de advertencias
    this.validationErrors = allErrors.filter(error =>
      error.code === 'REQUIRED' || error.code === 'PATTERN' || error.code === 'MAX_LENGTH'
    );

    this.validationWarnings = allErrors.filter(error =>
      error.code === 'MIN_LENGTH' || error.code === 'WARNING'
    );

    // Calcular estado de validación
    this.isValid = this.validationErrors.length === 0;

    // Calcular porcentaje de completitud
    this.calculateCompletionPercentage();
  }

  private calculateCompletionPercentage(): void {
    const requiredFields = this.template.fieldsDefinition.filter(field => field.required);
    const totalRequiredFields = requiredFields.length;

    if (totalRequiredFields === 0) {
      this.completionPercentage = 100;
      return;
    }

    const completedFields = requiredFields.filter(field => {
      const value = this.filledData[field.key];
      return this.isFieldCompleted(field.type, value);
    });

    this.completionPercentage = Math.round((completedFields.length / totalRequiredFields) * 100);
  }

  private isFieldCompleted(fieldType: string, value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    switch (fieldType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'tel':
      case 'url':
        return typeof value === 'string' && value.trim().length > 0;

      case 'number':
        return typeof value === 'number' && !isNaN(value);

      case 'date':
      case 'datetime-local':
        return value instanceof Date || (typeof value === 'string' && value.length > 0);

      case 'select':
      case 'radio':
        return typeof value === 'string' && value.length > 0;

      case 'multiselect':
        return Array.isArray(value) && value.length > 0;

      case 'checkbox':
        return typeof value === 'boolean';

      case 'file':
        return typeof value === 'string' && value.length > 0;

      case 'table':
        return Array.isArray(value) && value.length > 0;

      default:
        return !!value;
    }
  }

  getValidationSummary(): { errors: number; warnings: number; completion: number } {
    return {
      errors: this.validationErrors.length,
      warnings: this.validationWarnings.length,
      completion: this.completionPercentage
    };
  }

  getFieldValidationStatus(fieldKey: string): 'valid' | 'error' | 'warning' | 'empty' {
    const hasError = this.validationErrors.some(error => error.field === fieldKey);
    const hasWarning = this.validationWarnings.some(error => error.field === fieldKey);
    const field = this.template.fieldsDefinition.find(f => f.key === fieldKey);

    if (hasError) return 'error';
    if (hasWarning) return 'warning';

    if (field && field.required) {
      const value = this.filledData[fieldKey];
      return this.isFieldCompleted(field.type, value) ? 'valid' : 'empty';
    }

    return 'valid';
  }

  getFieldValidationIcon(fieldKey: string): string {
    const status = this.getFieldValidationStatus(fieldKey);

    switch (status) {
      case 'valid': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'exclamation-triangle';
      case 'empty': return 'clock';
      default: return 'help-circle';
    }
  }

  getFieldValidationClass(fieldKey: string): string {
    const status = this.getFieldValidationStatus(fieldKey);

    switch (status) {
      case 'valid': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'empty': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  }

  getErrorsForField(fieldKey: string): ValidationError[] {
    return this.validationErrors.filter(error => error.field === fieldKey);
  }

  getWarningsForField(fieldKey: string): ValidationError[] {
    return this.validationWarnings.filter(error => error.field === fieldKey);
  }
}
