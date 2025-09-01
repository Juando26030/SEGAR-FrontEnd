import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentTemplateDto } from '../../../core/DTOs/document-template.dto';
import { DocumentInstanceDto, DocumentStatus } from '../../../core/DTOs/document-instance.dto';
import { DocumentFormComponent } from '../document-form/document-form.component';

@Component({
  selector: 'app-document-menu',
  templateUrl: './document-menu.component.html',
  styleUrls: ['./document-menu.component.css'],
  standalone: true,
  imports: [CommonModule, DocumentFormComponent],
  providers: [TitleCasePipe, DatePipe]
})
export class DocumentMenuComponent implements OnInit, OnDestroy {
  @Input() tramiteId!: number;
  @Input() currentStep?: string;
  @Input() isVisible = false;

  templates: DocumentTemplateDto[] = [];
  instances: DocumentInstanceDto[] = [];
  loading = false;
  selectedDocument: DocumentTemplateDto | null = null;
  showForm = false;

  private destroy$ = new Subject<void>();

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(): void {
    this.loading = true;

    combineLatest([
      this.documentService.getDocumentTemplatesForTramite(this.tramiteId),
      this.documentService.getDocumentInstancesForTramite(this.tramiteId)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([templates, instances]) => {
        this.templates = templates;
        this.instances = instances;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.loading = false;
      }
    });
  }

  getDocumentStatus(template: DocumentTemplateDto): DocumentStatus | 'PENDING' {
    const instance = this.instances.find(i => i.templateId === template.id);
    return instance?.status || 'PENDING';
  }

  getDocumentInstance(template: DocumentTemplateDto): DocumentInstanceDto | null {
    return this.instances.find(i => i.templateId === template.id) || null;
  }

  getStatusIcon(status: DocumentStatus | 'PENDING'): string {
    switch (status) {
      case 'FINALIZED':
        return 'check-circle';
      case 'VERIFIED':
        return 'check';
      case 'UPLOADED':
        return 'upload';
      case 'FILLED':
        return 'edit';
      case 'DRAFT':
        return 'file-text';
      default:
        return 'clock';
    }
  }

  getStatusClass(status: DocumentStatus | 'PENDING'): string {
    switch (status) {
      case 'FINALIZED':
        return 'text-green-600 bg-green-100';
      case 'VERIFIED':
        return 'text-green-500 bg-green-50';
      case 'UPLOADED':
        return 'text-blue-600 bg-blue-100';
      case 'FILLED':
        return 'text-yellow-600 bg-yellow-100';
      case 'DRAFT':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  openDocument(template: DocumentTemplateDto): void {
    this.selectedDocument = template;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedDocument = null;
    this.loadDocuments(); // Recargar para obtener cambios
  }

  onDocumentSaved(): void {
    this.closeForm();
  }

  downloadDocument(template: DocumentTemplateDto): void {
    const instance = this.getDocumentInstance(template);
    if (instance) {
      this.documentService.downloadDocument(this.tramiteId, instance.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${template.name}_${instance.id}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Error downloading document:', error);
          }
        });
    }
  }

  exportToPdf(template: DocumentTemplateDto): void {
    const instance = this.getDocumentInstance(template);
    if (instance) {
      this.documentService.exportToPdf(this.tramiteId, instance.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('PDF exported successfully:', response);
            this.loadDocuments(); // Recargar para obtener el nuevo estado
          },
          error: (error) => {
            console.error('Error exporting PDF:', error);
          }
        });
    }
  }

  getCompletionPercentage(): number {
    if (this.templates.length === 0) return 0;

    const completed = this.templates.filter(template => {
      const status = this.getDocumentStatus(template);
      return status === 'FINALIZED' || status === 'VERIFIED';
    }).length;

    return Math.round((completed / this.templates.length) * 100);
  }

  canProceedToNextStep(): boolean {
    return this.templates.every(template => {
      if (this.isDocumentRequired(template)) {
        const status = this.getDocumentStatus(template);
        return status === 'FINALIZED' || status === 'VERIFIED';
      }
      return true;
    });
  }

  private isDocumentRequired(_template: DocumentTemplateDto): boolean {
    // Lógica para determinar si el documento es obligatorio en este paso
    // Esto debería venir de la configuración del backend
    return true; // Por defecto todos son requeridos
  }

  // Método faltante para trackBy en ngFor
  trackByTemplateId(index: number, template: DocumentTemplateDto): number {
    return template.id;
  }
}
