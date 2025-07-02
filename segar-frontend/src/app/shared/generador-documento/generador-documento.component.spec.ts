import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradorDocumentoComponent } from './generador-documento.component';

describe('GeneradorDocumentoComponent', () => {
  let component: GeneradorDocumentoComponent;
  let fixture: ComponentFixture<GeneradorDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneradorDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneradorDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
