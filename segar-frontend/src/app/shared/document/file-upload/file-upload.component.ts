import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFieldDefinition } from '../../../core/DTOs/document-template.dto';
import { DocumentService } from '../../../core/services/document.service';
import { FileUploadDto } from '../../../core/DTOs/document-instance.dto';

interface FileInfo {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress?: number;
  error?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  description?: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements OnInit, ControlValueAccessor {
  @Input() field!: DocumentFieldDefinition;
  @Input() tramiteId!: number;
  @Input() instanceId?: number;
  @Input() value: any = null; // Agregar Input value

  @Output() fileUploaded = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<any>(); // Agregar Output valueChange

  selectedFiles: FileInfo[] = [];
  isDragOver = false;
  uploadInProgress = false;

  private onChange = (_value: any) => {};
  private onTouched = () => {};

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    // Configurar validaciones de archivo basadas en field.allowedMime y field.maxSize
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      // Manejar valor inicial si es necesario
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar estado deshabilitado si es necesario
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  private handleFiles(fileList: FileList): void {
    const files = Array.from(fileList);

    files.forEach(file => {
      if (this.validateFile(file)) {
        const fileInfo: FileInfo = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: 'pending'
        };

        this.selectedFiles.push(fileInfo);
      }
    });

    this.onChange(this.selectedFiles);
    this.valueChange.emit(this.selectedFiles); // Emitir valueChange
    this.uploadFiles();
  }

  private validateFile(file: File): boolean {
    // Validar tipo de archivo
    if (this.field.allowedMime && !this.field.allowedMime.includes(file.type)) {
      console.error(`Tipo de archivo no permitido: ${file.type}`);
      return false;
    }

    // Validar tamaño
    if (this.field.maxSize && file.size > this.field.maxSize) {
      console.error(`Archivo muy grande: ${file.size} bytes`);
      return false;
    }

    return true;
  }

  getAcceptedTypes(): string {
    return this.field.allowedMime?.join(',') || '*/*';
  }

  canAddMoreFiles(): boolean {
    if (!this.field.multiple) {
      return this.selectedFiles.length === 0;
    }
    return true; // Sin límite para archivos múltiples por defecto
  }

  private uploadFiles(): void {
    if (!this.tramiteId || !this.instanceId || this.uploadInProgress) {
      return;
    }

    this.uploadInProgress = true;

    this.selectedFiles.forEach((fileInfo) => {
      if (fileInfo.status === 'pending') {
        this.uploadSingleFile(fileInfo);
      }
    });
  }

  private uploadSingleFile(fileInfo: FileInfo): void {
    fileInfo.status = 'uploading';

    const uploadData = {
      file: fileInfo.file,
      description: fileInfo.description || ''
    };

    this.documentService.uploadFile(this.tramiteId!, this.instanceId!, uploadData)
      .subscribe({
        next: (response) => {
          fileInfo.status = 'completed';
          fileInfo.uploadProgress = 100;
          this.fileUploaded.emit(response.fileUrl || '');
          this.checkUploadCompletion();
        },
        error: (error) => {
          fileInfo.status = 'error';
          fileInfo.error = error.message;
          console.error('Error uploading file:', error);
          this.checkUploadCompletion();
        }
      });
  }

  private checkUploadCompletion(): void {
    const allCompleted = this.selectedFiles.every(
      file => file.status === 'completed' || file.status === 'error'
    );

    if (allCompleted) {
      this.uploadInProgress = false;
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.onChange(this.selectedFiles);
    this.valueChange.emit(this.selectedFiles); // Emitir valueChange
  }

  retryUpload(fileInfo: FileInfo): void {
    if (fileInfo.status === 'error') {
      fileInfo.status = 'pending';
      fileInfo.error = undefined;
      fileInfo.uploadProgress = 0;
      this.uploadFiles();
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📁';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  hasErrors(): boolean {
    return this.selectedFiles.some(file => file.status === 'error');
  }

  isUploadComplete(): boolean {
    return this.selectedFiles.length > 0 &&
           this.selectedFiles.every(file => file.status === 'completed');
  }

  // Agregar método público para llamar uploadFiles desde el template
  public triggerUpload(): void {
    this.uploadFiles();
  }
}
