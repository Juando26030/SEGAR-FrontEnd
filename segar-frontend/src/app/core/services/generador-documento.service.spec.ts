import { TestBed } from '@angular/core/testing';

import { DocumentGeneratorService } from './generador-documento.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DocumentGeneratorService', () => {
  let service: DocumentGeneratorService = null as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DocumentGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
