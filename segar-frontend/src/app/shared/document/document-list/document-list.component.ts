import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { DocumentInstanceDto, DocumentStatus } from '../../../core/DTOs/document-instance.dto';
import { DocumentTemplateDto } from '../../../core/DTOs/document-template.dto';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe]
})
export class DocumentListComponent implements OnInit, OnDestroy {
  @Input() tramiteId!: number;
  @Input() viewMode: 'grid' | 'table' = 'table';
  @Input() showActions = true;
  @Input() compactView = false;

  @Output() documentSelected = new EventEmitter<DocumentInstanceDto>();
  @Output() documentDeleted = new EventEmitter<DocumentInstanceDto>();

  documents: DocumentInstanceDto[] = [];
  filteredDocuments: DocumentInstanceDto[] = [];
  templates: Map<number, DocumentTemplateDto> = new Map();
  loading = false;
  searchTerm = '';
  statusFilter: DocumentStatus | 'ALL' = 'ALL';
  sortBy: 'name' | 'status' | 'updatedAt' = 'updatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  private destroy$ = new Subject<void>();

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.subscribeToDocumentChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(): void {
    this.loading = true;

    this.documentService.getDocumentInstancesForTramite(this.tramiteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.documents = documents;
          this.loadTemplateInfo();
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.loading = false;
        }
      });
  }

  private loadTemplateInfo(): void {
    const templateIds = [...new Set(this.documents.map(doc => doc.templateId))];

    templateIds.forEach(templateId => {
      if (!this.templates.has(templateId)) {
        this.documentService.getDocumentTemplate(templateId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (template) => {
              this.templates.set(templateId, template);
            },
            error: (error) => {
              console.error(`Error loading template ${templateId}:`, error);
            }
          });
      }
    });
  }

  private subscribeToDocumentChanges(): void {
    this.documentService.documents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.documents = documents.filter(doc => doc.tramiteId === this.tramiteId);
        this.applyFilters();
      });
  }

  // Filter and search methods
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onStatusFilterChange(status: DocumentStatus | 'ALL'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onSortChange(sortBy: 'name' | 'status' | 'updatedAt'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.documents];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => {
        const template = this.templates.get(doc.templateId);
        const templateName = template?.name?.toLowerCase() || '';
        const templateCode = template?.code?.toLowerCase() || '';

        return templateName.includes(searchLower) || templateCode.includes(searchLower);
      });
    }

    // Apply status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === this.statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareResult = 0;

      switch (this.sortBy) {
        case 'name':
          const nameA = this.templates.get(a.templateId)?.name || '';
          const nameB = this.templates.get(b.templateId)?.name || '';
          compareResult = nameA.localeCompare(nameB);
          break;
        case 'status':
          compareResult = a.status.localeCompare(b.status);
          break;
        case 'updatedAt':
          compareResult = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return this.sortDirection === 'asc' ? compareResult : -compareResult;
    });

    this.filteredDocuments = filtered;
  }

  // Document actions
  selectDocument(document: DocumentInstanceDto): void {
    this.documentSelected.emit(document);
  }

  downloadDocument(documentInstance: DocumentInstanceDto): void {
    this.documentService.downloadDocument(this.tramiteId, documentInstance.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const template = this.templates.get(documentInstance.templateId);
          const fileName = `${template?.name || 'documento'}_${documentInstance.id}.pdf`;

          const url = window.URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading document:', error);
        }
      });
  }

  exportToPdf(document: DocumentInstanceDto): void {
    this.documentService.exportToPdf(this.tramiteId, document.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('PDF exported successfully:', response);
          // Optionally trigger a reload or show success message
        },
        error: (error) => {
          console.error('Error exporting PDF:', error);
        }
      });
  }

  deleteDocument(document: DocumentInstanceDto): void {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      // Note: Implement delete endpoint in DocumentService
      this.documentDeleted.emit(document);
    }
  }

  // Utility methods
  getDocumentTemplate(document: DocumentInstanceDto): DocumentTemplateDto | null {
    return this.templates.get(document.templateId) || null;
  }

  getStatusClass(status: DocumentStatus): string {
    switch (status) {
      case 'FINALIZED': return 'text-green-600 bg-green-100';
      case 'VERIFIED': return 'text-green-500 bg-green-50';
      case 'UPLOADED': return 'text-blue-600 bg-blue-100';
      case 'FILLED': return 'text-yellow-600 bg-yellow-100';
      case 'DRAFT': return 'text-orange-600 bg-orange-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusText(status: DocumentStatus): string {
    switch (status) {
      case 'FINALIZED': return 'Finalizado';
      case 'VERIFIED': return 'Verificado';
      case 'UPLOADED': return 'Subido';
      case 'FILLED': return 'Completado';
      case 'DRAFT': return 'Borrador';
      case 'REJECTED': return 'Rechazado';
      default: return 'Pendiente';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  trackByDocumentId(index: number, document: DocumentInstanceDto): number {
    return document.id;
  }
}
