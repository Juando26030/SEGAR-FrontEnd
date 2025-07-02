import { TestBed } from '@angular/core/testing';

import { GeneradorDocumentoService } from './generador-documento.service';

describe('GeneradorDocumentoService', () => {
  let service: GeneradorDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneradorDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
