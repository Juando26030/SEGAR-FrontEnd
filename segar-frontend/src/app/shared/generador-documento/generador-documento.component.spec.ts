import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradorDocumentoComponent } from './generador-documento.component';

describe('GeneradorDocumentoComponent', () => {
  let component: GeneradorDocumentoComponent = null as any;
  let fixture: ComponentFixture<GeneradorDocumentoComponent> = null as any;

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
