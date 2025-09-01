import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DocumentMenuComponent } from './document-menu/document-menu.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentExportComponent } from './document-export/document-export.component';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DocumentValidationComponent } from './document-validation/document-validation.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DocumentMenuComponent,
    DocumentFormComponent,
    DocumentListComponent,
    DocumentExportComponent,
    DynamicFieldComponent,
    FileUploadComponent,
    DocumentValidationComponent
  ],
  providers: [
    TitleCasePipe,
    DatePipe
  ],
  exports: [
    DocumentMenuComponent,
    DocumentFormComponent,
    DocumentListComponent,
    DocumentExportComponent,
    DynamicFieldComponent,
    FileUploadComponent,
    DocumentValidationComponent
  ]
})
export class DocumentModule { }
