import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentInstanceDto } from '../../../core/DTOs/document-instance.dto';
import { DocumentService } from '../../../core/services/document.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-export',
  templateUrl: './document-export.component.html',
  styleUrls: ['./document-export.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DocumentExportComponent implements OnInit, OnDestroy {
  @Input() documentInstance!: DocumentInstanceDto;
  @Input() tramiteId!: number;
  @Input() showButton = true;

  @Output() exportCompleted = new EventEmitter<string>();
  @Output() exportFailed = new EventEmitter<string>();

  isExporting = false;
  exportProgress = 0;
  exportedFileUrl: string | null = null;
  exportError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    // Componente inicializado
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  exportToPdf(): void {
    if (this.isExporting) return;

    this.isExporting = true;
    this.exportProgress = 0;
    this.exportError = null;
    this.exportedFileUrl = null;

    // Simular progreso
    const progressInterval = setInterval(() => {
      if (this.exportProgress < 80) {
        this.exportProgress += 10;
      }
    }, 200);

    this.documentService.exportToPdf(this.tramiteId, this.documentInstance.id, {
      outputFormat: 'pdf',
      includeEmbeddedFiles: true
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.exportProgress = 100;
        this.exportedFileUrl = response.fileUrl;
        this.isExporting = false;
        this.exportCompleted.emit(response.fileUrl);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.exportProgress = 0;
        this.exportError = error.message || 'Error al exportar el documento';
        this.isExporting = false;
        this.exportFailed.emit(this.exportError || 'Error desconocido');
      }
    });
  }

  downloadExportedFile(): void {
    if (!this.exportedFileUrl) return;

    const link = document.createElement('a');
    link.href = this.exportedFileUrl;
    link.download = `documento_${this.documentInstance.id}.pdf`;
    link.click();
  }

  resetExport(): void {
    this.exportedFileUrl = null;
    this.exportError = null;
    this.exportProgress = 0;
  }

  canExport(): boolean {
    return this.documentInstance.status === 'FILLED' || this.documentInstance.status === 'VERIFIED';
  }
}
