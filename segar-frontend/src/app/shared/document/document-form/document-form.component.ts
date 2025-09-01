import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, TitleCasePipe } from '@angular/common';

import { DocumentTemplateDto, DocumentFieldDefinition } from '../../../core/DTOs/document-template.dto';
import { DocumentInstanceDto, CreateDocumentInstanceDto, UpdateDocumentInstanceDto, ValidationError } from '../../../core/DTOs/document-instance.dto';
import { DocumentService } from '../../../core/services/document.service';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFieldComponent],
  providers: [TitleCasePipe]
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  @Input() template!: DocumentTemplateDto;
  @Input() tramiteId!: number;
  @Input() existingInstance?: DocumentInstanceDto | null;

  @Output() documentSaved = new EventEmitter<DocumentInstanceDto>();
  @Output() cancelled = new EventEmitter<void>();

  dynamicForm!: FormGroup;
  validationErrors: ValidationError[] = [];
  isSaving = false;
  isDirty = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.existingInstance) {
      this.loadExistingData();
    }
    this.setupFormChangeDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const formControls: { [key: string]: AbstractControl } = {};

    if (this.template.fieldsDefinition) {
      this.template.fieldsDefinition.forEach(field => {
        const validators = this.buildValidators(field);
        formControls[field.key] = this.createFormControl(field, validators);
      });
    }

    this.dynamicForm = this.fb.group(formControls);
  }

  private createFormControl(field: DocumentFieldDefinition, validators: any[]): AbstractControl {
    switch (field.type) {
      case 'table':
        return this.fb.array([]);
      case 'checkbox':
        return new FormControl(false, validators);
      case 'select':
        return new FormControl('', validators);
      default:
        return new FormControl('', validators);
    }
  }

  private buildValidators(field: DocumentFieldDefinition): any[] {
    const validators = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.minLength) {
      validators.push(Validators.minLength(field.minLength));
    }

    if (field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }

    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    return validators;
  }

  private loadExistingData(): void {
    if (this.existingInstance?.filledData) {
      this.dynamicForm.patchValue(this.existingInstance.filledData);
    }
  }

  private setupFormChangeDetection(): void {
    this.dynamicForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isDirty = true;
        this.validateForm();
      });
  }

  private validateForm(): void {
    this.validationErrors = this.documentService.validateDocumentData(
      this.template,
      this.dynamicForm.value
    );
  }

  addTableRow(fieldKey: string): void {
    const field = this.template.fieldsDefinition?.find(f => f.key === fieldKey);
    if (!field || field.type !== 'table') return;

    const tableArray = this.dynamicForm.get(fieldKey) as FormArray;
    const rowGroup = this.fb.group({});

    if (field.columns) {
      field.columns.forEach(column => {
        rowGroup.addControl(column.key || column, new FormControl(''));
      });
    }

    tableArray.push(rowGroup);
  }

  getTableRows(fieldKey: string): FormArray {
    return this.dynamicForm.get(fieldKey) as FormArray;
  }

  getTableColumns(fieldKey: string): any[] {
    const field = this.template.fieldsDefinition?.find(f => f.key === fieldKey);
    return field?.columns || [];
  }

  onSubmit(): void {
    if (this.dynamicForm.valid && !this.isSaving) {
      this.save();
    }
  }

  private save(): void {
    this.isSaving = true;

    const documentData: CreateDocumentInstanceDto | UpdateDocumentInstanceDto = {
      templateId: this.template.id,
      filledData: this.dynamicForm.value
    };

    const saveOperation = this.existingInstance
      ? this.documentService.updateDocumentInstance(
          this.tramiteId,
          this.existingInstance.id,
          documentData as UpdateDocumentInstanceDto
        )
      : this.documentService.createDocumentInstance(this.tramiteId, documentData as CreateDocumentInstanceDto);

    saveOperation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedDocument) => {
          this.isSaving = false;
          this.isDirty = false;
          this.documentSaved.emit(savedDocument);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error al guardar documento:', error);
        }
      });
  }
}
